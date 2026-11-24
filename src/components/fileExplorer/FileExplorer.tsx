import { useState, useRef, useEffect, useMemo } from 'react';
import type { TreeApi } from 'react-arborist';
import { findNodeById } from '@helpers/findNodeById';
import { buildTree } from '@helpers/buildTree';
import { getContainingSpecialFolder, isSpecialFolderId } from '@helpers/systemFolders';
import { useFiles } from '@hooks/files/useFiles';
import { useImageImport } from '@hooks/files/useImageImport';
import { useElementHeight } from '@hooks/files/useElementHeight';
import { useFileDrop } from '@hooks/files/useFileDrop';
import { useTrashActions } from '@hooks/files/useTrashActions';
import { useTreeNodeEditing } from '@hooks/files/useTreeNodeEditing';
import { useActiveFile } from '@hooks/useActiveFile';
import FileExplorerToolbar from '@components/fileExplorer/FileExplorerToolbar';
import FileTree from '@components/fileExplorer/FileTree';
import ConfirmDeleteModal from '@components/fileExplorer/ConfirmDeleteModal';
import type { TreeNode } from '@/types/file';
import { IMAGES_ID, TRASH_ID } from '@constants/fileSystem';

interface FileExplorerProps {
    isOpen: boolean;
    onClose: () => void;
}

const FileExplorer = ({ isOpen, onClose }: FileExplorerProps) => {
    const files = useFiles();
    const treeData = useMemo(() => (files ? buildTree(files) : []), [files]);
    // Explicit user selection made inside the tree (click on a node), along with the file that was active after it
    const [selection, setSelection] = useState<{ node: TreeNode; activeFileId: string | null } | null>(null);
    const { activeFileId, setActiveFileId } = useActiveFile();
    const treeApiRef = useRef<TreeApi<TreeNode> | null>(null);
    const { importImages } = useImageImport({ notifySuccess: true });
    const treeContainerRef = useRef<HTMLDivElement>(null);
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

    // Saves the images into the Images folder, then opens it and selects the last one
    const handleImportImages = async (fileList: FileList | null) => {
        const saved = await importImages(Array.from(fileList ?? []));
        if (saved.length === 0) return;
        treeApiRef.current?.open(IMAGES_ID);
        selectNode(saved[saved.length - 1]);
    };

    const editing = useTreeNodeEditing({ effectiveSelectedNode, allEntries, selectNode, treeApiRef });
    const { confirmAction, requestDelete, runConfirmedAction, cancelConfirm } = useTrashActions({
        allEntries,
        onSelectionCleared: () => setSelection(null),
    });
    const { isDraggingFiles, dropHandlers } = useFileDrop(handleImportImages);

    // Brings the active file into view when it changes (e.g. a file imported while the explorer is open):
    // the tree only renders the rows that fit, so a new file at the end could be out of sight.
    // react-arborist waits for the row to exist, since the file list may not include it yet
    useEffect(() => {
        if (activeFileId) treeApiRef.current?.scrollTo(activeFileId);
    }, [activeFileId]);

    // react-arborist virtualizes the list, so it needs its height in pixels (it defaults to a fixed 500px):
    // it gets the space left under the toolbar, and follows it when the window is resized
    const treeHeight = useElementHeight(treeContainerRef, isOpen);

    if (!isOpen) return null;

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
            {...dropHandlers}
            className={`w-80 max-w-full h-full bg-[#D4D4D4] text-[#252526] flex flex-col shrink-0 panel-overlay:fixed panel-overlay:inset-y-0 panel-overlay:left-0 panel-overlay:z-50 panel-overlay:shadow-xl ${
                isDraggingFiles ? 'outline-2 -outline-offset-2 outline-dashed outline-sky-500' : ''
            }`}
        >
            <FileExplorerToolbar
                isBusy={editing.isBusy}
                canRename={!!effectiveSelectedNode && !isSystemFolderSelected}
                deleteLabel={deleteLabel}
                hasSelection={!!effectiveSelectedNode}
                showUploadImages={isInImages}
                onCreateFile={editing.handleCreateFile}
                onCreateFolder={editing.handleCreateFolder}
                onUploadImages={handleImportImages}
                onRename={editing.handleRename}
                onDelete={() => requestDelete(effectiveSelectedNode)}
                onClose={onClose}
            />

            <div ref={treeContainerRef} className="flex-1 min-h-0 overflow-hidden">
                <FileTree
                    treeData={treeData}
                    treeApiRef={treeApiRef}
                    height={treeHeight}
                    selectedNodeId={effectiveSelectedNode?.id}
                    pendingNode={editing.pendingNode}
                    renamingNodeId={editing.renamingNodeId}
                    onSelectNode={selectNode}
                    onConfirmPendingNode={editing.confirmPendingNode}
                    onDiscardPendingNode={editing.discardPendingNode}
                    onConfirmRename={editing.confirmRename}
                    onCancelRename={editing.cancelRename}
                />
            </div>
            {confirmAction && (
                <ConfirmDeleteModal
                    action={confirmAction}
                    onConfirm={runConfirmedAction}
                    onCancel={cancelConfirm}
                />
            )}
        </aside>
    );
};

export default FileExplorer;
