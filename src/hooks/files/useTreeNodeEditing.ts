import { useEffect, useRef, useState, type RefObject } from 'react';
import type { TreeApi } from 'react-arborist';
import { createFileSystemEntry } from '@helpers/createEntry';
import { renameFileSystemEntry } from '@helpers/renameEntry';
import { getContainingSpecialFolder } from '@helpers/systemFolders';
import { useAlerts } from '@hooks/useAlerts';
import { storageErrorMessage } from '@utils/alertMessages';
import type { FileSystemEntry, PendingNodeInfo, TreeNode } from '@/types/file';

interface UseTreeNodeEditingOptions {
    effectiveSelectedNode: TreeNode | null;
    allEntries: FileSystemEntry[];
    selectNode: (node: TreeNode | null) => void;
    treeApiRef: RefObject<TreeApi<TreeNode> | null>;
}

// Creating and renaming tree nodes through the inline name input
export function useTreeNodeEditing({ effectiveSelectedNode, allEntries, selectNode, treeApiRef }: UseTreeNodeEditingOptions) {
    const alerts = useAlerts();
    // Node currently being created (file/folder), rendered as an inline input
    const [pendingNode, setPendingNode] = useState<PendingNodeInfo | null>(null);
    // Id of the node currently being renamed, rendered as an inline input
    const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
    // Prevents double-submission if confirmPendingNode fires twice
    const isCreatingRef = useRef(false);

    // Auto-expand the parent folder so the inline "new node" input is visible
    useEffect(() => {
        if (pendingNode?.parentId) {
            treeApiRef.current?.open(pendingNode.parentId);
        }
    }, [pendingNode, treeApiRef]);

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

    // Disables toolbar actions while an inline create/rename input is active
    const isBusy = !!pendingNode || !!renamingNodeId;

    return {
        pendingNode,
        renamingNodeId,
        isBusy,
        handleCreateFile,
        handleCreateFolder,
        confirmPendingNode,
        discardPendingNode,
        handleRename,
        confirmRename,
        cancelRename,
    };
}
