import { useState } from 'react';
import { getContainingSpecialFolder } from '@helpers/systemFolders';
import { collectDescendantIds, emptyFolder, hardDeleteEntry, moveToTrash, restoreFromTrash } from '@helpers/deleteEntry';
import { pickFallbackFile } from '@helpers/fallbackFile';
import { useActiveFile } from '@hooks/useActiveFile';
import { useEditor } from '@hooks/useEditor';
import { useAlerts } from '@hooks/useAlerts';
import { storageErrorMessage } from '@utils/alertMessages';
import type { FileSystemEntry, TreeNode } from '@/types/file';
import { TRASH_ID } from '@constants/fileSystem';

// Permanent deletions wait for the user's confirmation
export type ConfirmAction = { kind: 'empty' } | { kind: 'delete'; node: TreeNode };

interface UseTrashActionsOptions {
    allEntries: FileSystemEntry[];
    onSelectionCleared: () => void;
}

export function useTrashActions({ allEntries, onSelectionCleared }: UseTrashActionsOptions) {
    const { activeFileId, setActiveFileId } = useActiveFile();
    const { disposeFileModel } = useEditor();
    const alerts = useAlerts();
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

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
    const requestDelete = async (node: TreeNode | null) => {
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
        onSelectionCleared();

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
            onSelectionCleared();
        }
    };

    const cancelConfirm = () => setConfirmAction(null);

    return { confirmAction, requestDelete, runConfirmedAction, cancelConfirm };
}
