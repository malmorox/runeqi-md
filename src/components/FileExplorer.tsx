import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { IoClose } from 'react-icons/io5';
import { HiDocumentPlus, HiFolderPlus, HiPhoto, HiOutlinePhoto } from 'react-icons/hi2';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { GoTriangleRight, GoTriangleDown } from "react-icons/go";
import { Tree, type TreeApi } from 'react-arborist';
import { insertPendingNode } from '@helpers/insertPendingNode';
import { createFileSystemEntry } from '@helpers/createEntry';
import { renameFileSystemEntry } from '@helpers/renameEntry';
import { findNodeById } from '@helpers/findNodeById';
import { buildTree } from '@helpers/buildTree';
import { getContainingSpecialFolder, isSpecialFolderId } from '@helpers/systemFolders';
import { ACCEPTED_IMAGE_TYPES } from '@helpers/images';
import { collectDescendantIds, emptyFolder, hardDeleteEntry, moveToTrash, restoreFromTrash } from '@helpers/deleteEntry';
import { pickFallbackFile } from '@helpers/fallbackFile';
import { useFiles } from '@hooks/files/useFiles';
import { useImageImport } from '@hooks/files/useImageImport';
import { useActiveFile } from '@hooks/useActiveFile';
import { useEditor } from '@hooks/useEditor';
import { useAlerts } from '@hooks/useAlerts';
import { storageErrorMessage } from '@utils/alertMessages';
import TreeNodeNameInput from '@components/ui/TreeNodeNameInput';
import ConfirmModal from '@components/ui/ConfirmModal';
import type { TreeNode, PendingNodeInfo } from '@/types/file';
import { PENDING_NODE_ID, IMAGES_ID, TRASH_ID } from '@constants/fileSystem';

// Permanent deletions wait for the user's confirmation
type ConfirmAction = { kind: 'empty' } | { kind: 'delete'; node: TreeNode };

interface FileExplorerProps {
    isOpen: boolean;
    onClose: () => void;
}

const FileExplorer = ({ isOpen, onClose }: FileExplorerProps) => {
    const files = useFiles();
    const treeData = useMemo(() => (files ? buildTree(files) : []), [files]);
    // Explicit user selection made inside the tree (click on a node), along with the file that was active after it
    const [selection, setSelection] = useState<{ node: TreeNode; activeFileId: string | null } | null>(null);
    // Node currently being created (file/folder), rendered as an inline input
    const [pendingNode, setPendingNode] = useState<PendingNodeInfo | null>(null);
    // Id of the node currently being renamed, rendered as an inline input
    const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
    const { activeFileId, setActiveFileId } = useActiveFile();
    const { disposeFileModel } = useEditor();
    // Prevents double-submission if confirmPendingNode fires twice
    const isCreatingRef = useRef(false);
    const treeApiRef = useRef<TreeApi<TreeNode> | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const { importImages } = useImageImport({ notifySuccess: true });
    const alerts = useAlerts();
    // Files from the OS are being dragged over the explorer
    const [isDraggingFiles, setDraggingFiles] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
    const treeContainerRef = useRef<HTMLDivElement>(null);
    const [treeHeight, setTreeHeight] = useState(0);
    const allEntries = files ?? [];

    // The explicit selection only lasts while the same file stays active: once another one is opened
    // from outside the explorer (e.g. an imported file), the selection follows it
    const selectedNode = selection?.activeFileId === activeFileId ? selection.node : null;

    /*
    ** Resolves what the tree should visually treat as "selected":
    ** - the user's explicit selection, if any
    ** - otherwise, the currently active file (e.g. set externally by
    **   useEnsureFileSystem on first launch, or after deleting a file, or by an import)
    ** Derived with useMemo instead of synced via useEffect + setState.
    */
    const effectiveSelectedNode = useMemo(() => {
        if (selectedNode) return selectedNode;
        if (!activeFileId) return null;
        return findNodeById(treeData, activeFileId);
    }, [selectedNode, activeFileId, treeData]);

    // Selecting a file also opens it; folders and images keep the current file open
    const selectNode = (node: TreeNode | null) => {
        const nextActiveFileId = node?.type === 'file' ? node.id : activeFileId;
        setSelection(node && { node, activeFileId: nextActiveFileId });
        if (nextActiveFileId !== activeFileId) setActiveFileId(nextActiveFileId);
    };

    // Auto-expand the parent folder so the inline "new node" input is visible
    useEffect(() => {
        if (pendingNode?.parentId) {
            treeApiRef.current?.open(pendingNode.parentId);
        }
    }, [pendingNode]);

    // Brings the active file into view when it changes (e.g. a file imported while the explorer is open):
    // the tree only renders the rows that fit, so a new file at the end could be out of sight.
    // react-arborist waits for the row to exist, since the file list may not include it yet
    useEffect(() => {
        if (activeFileId) treeApiRef.current?.scrollTo(activeFileId);
    }, [activeFileId]);

    // react-arborist virtualizes the list, so it needs its height in pixels (it defaults to a fixed 500px):
    // it gets the space left under the toolbar, and follows it when the window is resized
    useLayoutEffect(() => {
        const container = treeContainerRef.current;
        if (!container) return;
        // Measured right away so the first paint already has the right height; the observer handles later resizes
        setTreeHeight(container.clientHeight);
        const observer = new ResizeObserver(([entry]) => setTreeHeight(entry.contentRect.height));
        observer.observe(container);
        return () => observer.disconnect();
    }, [isOpen]);

    if (!isOpen) return null;

    // New files/folders are created inside the selected folder, or as a
    // sibling of the selected file (using its parentId). Root if nothing selected.
    const resolveTargetParentId = (): string | null => {
        if (!effectiveSelectedNode) return null;
        const parentId = effectiveSelectedNode.type === 'folder' ? effectiveSelectedNode.id : effectiveSelectedNode.parentId;
        // System folders only hold their own content (images, deleted entries): new files go to the root instead
        return getContainingSpecialFolder(parentId, allEntries) ? null : parentId;
    };

    const handleCreateFile = () => {
        const parentId = resolveTargetParentId();
        setPendingNode({ type: 'file', parentId });
    };

    const handleCreateFolder = () => {
        // Folders are always created at the root level because nesting folders is not supported
        setPendingNode({ type: 'folder', parentId: null });
    };

    const confirmPendingNode = async (rawName: string) => {
        if (!pendingNode || isCreatingRef.current) return;
        isCreatingRef.current = true;

        const name = rawName.trim();
        try {
            if (name) {
                const newEntry = await createFileSystemEntry(name, pendingNode);
                selectNode(newEntry);
            }
        } catch (error) {
            alerts.error({ title: `The ${pendingNode.type} couldn't be created`, message: storageErrorMessage(error) });
        } finally {
            setPendingNode(null);
            isCreatingRef.current = false;
        }
    };

    const discardPendingNode = () => setPendingNode(null);

    const handleRename = () => {
        if (!effectiveSelectedNode) return;
        setRenamingNodeId(effectiveSelectedNode.id);
    };

    const confirmRename = async (rawName: string) => {
        if (!renamingNodeId) return;

        const name = rawName.trim();
        try {
            if (name) {
                await renameFileSystemEntry(renamingNodeId, name);
            }
        } catch (error) {
            alerts.error({ title: "It couldn't be renamed", message: storageErrorMessage(error) });
        } finally {
            setRenamingNodeId(null);
        }
    };

    const cancelRename = () => setRenamingNodeId(null);

    // Ids of an entry and everything inside it
    const withDescendants = (id: string) => new Set([id, ...collectDescendantIds(id, allEntries)]);

    // If the active file is about to be trashed or deleted, another one is opened first.
    // With nothing to switch to, it stays active: the editor is never left empty.
    const moveActiveFileOutOf = (ids: Set<string>, { allowTrash }: { allowTrash: boolean }) => {
        if (!activeFileId || !ids.has(activeFileId)) return;
        const next = pickFallbackFile(allEntries, { exclude: ids, allowTrash });
        if (next) setActiveFileId(next.id);
    };

    // Deleting moves to Trash; inside Trash it deletes for good (after confirming)
    const handleDelete = async () => {
        const node = effectiveSelectedNode;
        if (!node) return;

        if (node.id === TRASH_ID) {
            setConfirmAction({ kind: 'empty' });
            return;
        }
        if (getContainingSpecialFolder(node.id, allEntries) === TRASH_ID) {
            setConfirmAction({ kind: 'delete', node });
            return;
        }

        // Where it was (the selection may be older than the file list) and what was open, for "Undo"
        const parentId = allEntries.find((e) => e.id === node.id)?.parentId ?? node.parentId;
        const ids = withDescendants(node.id);
        const openFileId = activeFileId && ids.has(activeFileId) ? activeFileId : null;

        // Only files outside Trash are candidates: if there are none, the trashed file stays open
        moveActiveFileOutOf(ids, { allowTrash: false });
        try {
            await moveToTrash(node.id);
        } catch (error) {
            alerts.error({ title: `"${node.name}" couldn't be moved to Trash`, message: storageErrorMessage(error) });
            return;
        }
        setSelection(null);

        alerts.info({
            title: 'Moved to Trash',
            message: `"${node.name}" stays in Trash until it's emptied.`,
            action: { label: 'Undo', onClick: () => undoMoveToTrash(node, parentId, openFileId) },
        });
    };

    // Puts it back where it was and, if the open file was in it, opens that file again
    const undoMoveToTrash = async (node: TreeNode, parentId: string | null, openFileId: string | null) => {
        try {
            const isRestored = await restoreFromTrash(node.id, parentId);
            if (isRestored && openFileId) setActiveFileId(openFileId);
        } catch (error) {
            alerts.error({ title: `"${node.name}" couldn't be restored`, message: storageErrorMessage(error) });
        }
    };

    const runConfirmedAction = async () => {
        if (!confirmAction) return;
        const ids = confirmAction.kind === 'empty'
            ? new Set(collectDescendantIds(TRASH_ID, allEntries))
            : withDescendants(confirmAction.node.id);

        // If no file is left at all, useEnsureFileSystem creates a new welcome file
        moveActiveFileOutOf(ids, { allowTrash: true });
        ids.forEach(disposeFileModel);
        try {
            if (confirmAction.kind === 'empty') {
                const count = allEntries.filter((e) => e.parentId === TRASH_ID).length;
                await emptyFolder(TRASH_ID);
                alerts.success({
                    title: 'Trash emptied',
                    message: `${count} ${count === 1 ? 'item was' : 'items were'} permanently deleted.`,
                });
            } else {
                await hardDeleteEntry(confirmAction.node.id);
                alerts.success({ title: 'Deleted permanently', message: `"${confirmAction.node.name}" is gone for good.` });
            }
        } catch (error) {
            alerts.error({
                title: confirmAction.kind === 'empty' ? "Trash couldn't be emptied" : `"${confirmAction.node.name}" couldn't be deleted`,
                message: storageErrorMessage(error),
            });
        } finally {
            setConfirmAction(null);
            setSelection(null);
        }
    };

    // Saves the images into the Images folder, then opens it and selects the last one
    const handleImportImages = async (fileList: FileList | null) => {
        const saved = await importImages(Array.from(fileList ?? []));
        if (saved.length === 0) return;
        treeApiRef.current?.open(IMAGES_ID);
        selectNode(saved[saved.length - 1]);
    };

    const isFileDrag = (e: React.DragEvent) => e.dataTransfer.types.includes('Files');

    const handleDragOver = (e: React.DragEvent) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDraggingFiles(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // dragleave also fires when moving between the explorer's own children
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDraggingFiles(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        setDraggingFiles(false);
        handleImportImages(e.dataTransfer.files);
    };

    // Injects a temporary placeholder node into the tree while creating a new file/folder
    const displayTreeData = pendingNode
        ? insertPendingNode(treeData, pendingNode)
        : treeData;
    
    // Disables toolbar actions while an inline create/rename input is active
    const isBusy = !!pendingNode || !!renamingNodeId;
    // System folders (Images, Trash) can't be renamed, deleted or moved
    const isSystemFolderSelected = !!effectiveSelectedNode && isSpecialFolderId(effectiveSelectedNode.id);
    // The upload button only shows while working in the Images folder (the folder itself or one of its images)
    const isInImages = !!effectiveSelectedNode && getContainingSpecialFolder(effectiveSelectedNode.id, allEntries) === IMAGES_ID;
    // What the delete button does for the selection (null: nothing, e.g. the Images folder or an empty Trash)
    const deleteLabel = (() => {
        if (!effectiveSelectedNode) return null;
        if (effectiveSelectedNode.id === TRASH_ID) {
            return allEntries.some((e) => e.parentId === TRASH_ID) ? 'Empty Trash' : null;
        }
        if (isSystemFolderSelected) return null;
        return getContainingSpecialFolder(effectiveSelectedNode.id, allEntries) === TRASH_ID
            ? 'Delete permanently'
            : 'Move to Trash';
    })();

    return (
        <aside
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-80 h-full bg-[#D4D4D4] text-[#252526] flex flex-col shrink-0 ${
                isDraggingFiles ? 'outline-2 -outline-offset-2 outline-dashed outline-sky-500' : ''
            }`}
        >
            <div className="flex items-center h-12 px-3 gap-1 bg-[#bbbbbb]">
                <button
                    onClick={handleCreateFile}
                    disabled={isBusy}
                    className="p-1 hover:bg-[#A8A8A8] rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="New file"
                >
                    <HiDocumentPlus size={20} />
                </button>
                <button
                    onClick={handleCreateFolder}
                    disabled={isBusy}
                    className="p-1 hover:bg-[#A8A8A8] rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="New folder"
                >
                    <HiFolderPlus size={20} />
                </button>
                {isInImages && (
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isBusy}
                        className="p-1 hover:bg-[#A8A8A8] rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Upload images"
                    >
                        <HiPhoto size={20} />
                    </button>
                )}
                <input
                    ref={imageInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    multiple
                    hidden
                    onChange={(e) => {
                        handleImportImages(e.currentTarget.files);
                        // Allows picking the same file again
                        e.currentTarget.value = '';
                    }}
                />
                <button
                    onClick={handleRename}
                    disabled={isBusy || !effectiveSelectedNode || isSystemFolderSelected}
                    className="p-1 hover:bg-[#A8A8A8] rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Rename selected"
                >
                    <FaPencilAlt size={18} />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isBusy || !effectiveSelectedNode || !deleteLabel}
                    className="p-1 hover:bg-[#A8A8A8] rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title={deleteLabel ?? 'Delete selected'}
                >
                    <FaTrash size={18} />
                </button>
                <span className="flex-1" />
                <button 
                    onClick={onClose} 
                    className="p-1 text-[#2d2d30] hover:bg-[#A8A8A8] rounded transition-colors cursor-pointer" 
                    title="Close explorer"
                >
                    <IoClose size={25} color="#2d2d30" />
                </button>
            </div>

            <div ref={treeContainerRef} className="flex-1 min-h-0 overflow-hidden">
                <Tree<TreeNode>
                    data={displayTreeData}
                    openByDefault={false}
                    ref={treeApiRef}
                    rowHeight={24}
                    width="100%"
                    height={treeHeight}
                    // Rows come with `min-width: max-content` and grow with long names (horizontal scroll):
                    // they're kept to the panel's width and the names are truncated instead
                    rowClassName="min-w-0!"
                    disableDrag={(data) => isSpecialFolderId(data.id)}
                    onSelect={(nodes) => {
                        const node = nodes[0]?.data ?? null;
                        // Ignore selection events for the temporary placeholder node
                        if (node?.id === PENDING_NODE_ID) return;
                        selectNode(node);
                    }}
                >
                    {({ node, style, dragHandle }) => {
                        if (node.data.id === PENDING_NODE_ID) {
                            return (
                                <TreeNodeNameInput
                                    type={pendingNode!.type}
                                    style={style}
                                    isOpen={node.isOpen}
                                    onConfirm={confirmPendingNode}
                                    onCancel={discardPendingNode}
                                />
                            );
                        }

                        if (node.data.id === renamingNodeId) {
                            return (
                                <TreeNodeNameInput
                                    type={node.data.type}
                                    style={style}
                                    isOpen={node.isOpen}
                                    defaultValue={node.data.name}
                                    onConfirm={confirmRename}
                                    onCancel={cancelRename}
                                />
                            );
                        }

                        const isFolder = node.data.type === 'folder';
                        const isSelected = node.data.id === effectiveSelectedNode?.id;

                        return (
                            <div
                                style={style}
                                ref={dragHandle}
                                onClick={() => {
                                    if (isFolder) node.toggle();
                                }}
                                title={node.data.name}
                                className={`h-full min-w-0 box-border px-2 cursor-pointer text-sm leading-5 flex items-center gap-1 ${
                                    isSelected ? 'bg-[#A8A8A8]' : ''
                                }`}
                            >
                                {isFolder ? (
                                    node.isOpen
                                        ? <GoTriangleDown size={14} className="shrink-0" />
                                        : <GoTriangleRight size={14} className="shrink-0" />
                                ) : node.data.type === 'image' ? (
                                    <HiOutlinePhoto size={14} className="shrink-0" aria-hidden />
                                ) : (
                                    <span className="w-3.5 shrink-0" />
                                )}
                                {/* Long names end in "…" (the full name shows on hover) */}
                                <span className="truncate">{node.data.name}</span>
                            </div>
                        );
                    }}
                </Tree>
            </div>
            {confirmAction && (
                <ConfirmModal
                    title={
                        confirmAction.kind === 'empty'
                            ? 'Empty Trash?'
                            : `Delete "${confirmAction.node.name}" permanently?`
                    }
                    message={
                        confirmAction.kind === 'empty'
                            ? "Everything inside Trash will be permanently deleted. This can't be undone."
                            : `This will permanently delete "${confirmAction.node.name}". This can't be undone.`
                    }
                    confirmLabel={confirmAction.kind === 'empty' ? 'Empty Trash' : 'Delete'}
                    onConfirm={runConfirmedAction}
                    onCancel={() => setConfirmAction(null)}
                />
            )}
        </aside>
    );
};

export default FileExplorer;