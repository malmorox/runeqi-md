import { useState, useRef, useEffect, useMemo } from 'react';
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
import { collectDescendantIds, emptyFolder, hardDeleteEntry, moveToTrash } from '@helpers/deleteEntry';
import { pickFallbackFile } from '@helpers/fallbackFile';
import { useFiles } from '@hooks/files/useFiles';
import { useImageImport } from '@hooks/files/useImageImport';
import { useActiveFile } from '@hooks/useActiveFile';
import { useEditor } from '@hooks/useEditor';
import TreeNodeNameInput from '@components/ui/TreeNodeNameInput';
import AlertModal from '@components/ui/AlertModal';
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
    // Explicit user selection made inside the tree (click on a node).
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
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
    const { importImages, importError, clearImportError } = useImageImport();
    // Files from the OS are being dragged over the explorer
    const [isDraggingFiles, setDraggingFiles] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
    const allEntries = files ?? [];

    /*
    ** Resolves what the tree should visually treat as "selected":
    ** - the user's explicit selection, if any
    ** - otherwise, the currently active file (e.g. set externally by
    **   useEnsureFileSystem on first launch, or after deleting a file)
    ** Derived with useMemo instead of synced via useEffect + setState.
    */
    const effectiveSelectedNode = useMemo(() => {
        if (selectedNode) return selectedNode;
        if (!activeFileId) return null;
        return findNodeById(treeData, activeFileId);
    }, [selectedNode, activeFileId, treeData]);

    // Auto-expand the parent folder so the inline "new node" input is visible
    useEffect(() => {
        if (pendingNode?.parentId) {
            treeApiRef.current?.open(pendingNode.parentId);
        }
    }, [pendingNode]);

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
        if (name) {
            const newEntry = await createFileSystemEntry(name, pendingNode);
            setSelectedNode(newEntry);
            if (newEntry.type === 'file') {
                setActiveFileId(newEntry.id);
            }
        }

        setPendingNode(null);
        isCreatingRef.current = false;
    };

    const discardPendingNode = () => setPendingNode(null);

    const handleRename = () => {
        if (!effectiveSelectedNode) return;
        setRenamingNodeId(effectiveSelectedNode.id);
    };

    const confirmRename = async (rawName: string) => {
        if (!renamingNodeId) return;

        const name = rawName.trim();
        if (name) {
            await renameFileSystemEntry(renamingNodeId, name);
        }

        setRenamingNodeId(null);
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

        // Only files outside Trash are candidates: if there are none, the trashed file stays open
        moveActiveFileOutOf(withDescendants(node.id), { allowTrash: false });
        await moveToTrash(node.id);
        setSelectedNode(null);
    };

    const runConfirmedAction = async () => {
        if (!confirmAction) return;
        const ids = confirmAction.kind === 'empty'
            ? new Set(collectDescendantIds(TRASH_ID, allEntries))
            : withDescendants(confirmAction.node.id);

        // If no file is left at all, useEnsureFileSystem creates a new welcome file
        moveActiveFileOutOf(ids, { allowTrash: true });
        ids.forEach(disposeFileModel);
        if (confirmAction.kind === 'empty') {
            await emptyFolder(TRASH_ID);
        } else {
            await hardDeleteEntry(confirmAction.node.id);
        }

        setConfirmAction(null);
        setSelectedNode(null);
    };

    // Saves the images into the Images folder, then opens it and selects the last one
    const handleImportImages = async (fileList: FileList | null) => {
        const saved = await importImages(Array.from(fileList ?? []));
        if (saved.length === 0) return;
        treeApiRef.current?.open(IMAGES_ID);
        setSelectedNode(saved[saved.length - 1]);
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
            className={`w-72 h-full bg-[#D4D4D4] text-[#252526] flex flex-col shrink-0 ${
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
                <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isBusy}
                    className="p-1 hover:bg-[#A8A8A8] rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Upload images"
                >
                    <HiPhoto size={20} />
                </button>
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

            <div className="flex-1 overflow-auto">
                <Tree<TreeNode>
                    data={displayTreeData}
                    openByDefault={false}
                    ref={treeApiRef}
                    rowHeight={24}
                    width="100%"
                    disableDrag={(data) => isSpecialFolderId(data.id)}
                    onSelect={(nodes) => {
                        const node = nodes[0]?.data ?? null;
                        // Ignore selection events for the temporary placeholder node
                        if (node?.id === PENDING_NODE_ID) return;
                        setSelectedNode(node);
                        if (node?.type === 'file') setActiveFileId(node.id);
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
                                className={`h-full box-border px-2 cursor-pointer text-sm leading-5 flex items-center gap-1 ${
                                    isSelected ? 'bg-[#A8A8A8]' : ''
                                }`}
                            >
                                {isFolder ? (
                                    node.isOpen ? <GoTriangleDown size={14} /> : <GoTriangleRight size={14} />
                                ) : node.data.type === 'image' ? (
                                    <HiOutlinePhoto size={14} className="shrink-0" aria-hidden />
                                ) : (
                                    <span className="w-3.5" />
                                )}
                                <span className="text-xm">{node.data.name}</span>
                            </div>
                        );
                    }}
                </Tree>
            </div>
            {importError && (
                <AlertModal
                    title="Some images couldn't be added"
                    message={importError}
                    onClose={clearImportError}
                />
            )}
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