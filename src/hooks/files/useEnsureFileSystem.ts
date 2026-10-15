import { useEffect, useRef } from 'react';
import { useFiles } from './useFiles';
import { useActiveFile } from '../useActiveFile';
import { createFileSystemEntry } from '@helpers/createEntry';
import { ensureSystemFolders } from '@helpers/systemFolders';
import { pickFallbackFile } from '@helpers/fallbackFile';

/**
 * Keeps the file system usable at all times:
 * - The system folders (Images and Trash) always exist
 * - There's always an active file, so the editor is never left empty:
 *   if the active one is missing (app start, deleted for good...) the most recently edited file is opened,
 *   preferring the ones outside Trash; if there are no files at all, a new welcome file is created
 */
export function useEnsureFileSystem() {
    // Live-queried list of entries from Dexie (undefined while loading).
    const files = useFiles();
    const { activeFileId, setActiveFileId } = useActiveFile();
    const hasEnsuredFolders = useRef(false);
    // A welcome file is being created: the live query may not include it yet, so no other one is created meanwhile
    const isCreatingWelcomeFile = useRef(false);

    useEffect(() => {
        if (hasEnsuredFolders.current) return;
        hasEnsuredFolders.current = true;
        ensureSystemFolders();
    }, []);

    useEffect(() => {
        // Dexie hasn't resolved the query yet — wait for real data.
        if (files === undefined) return;
        if (activeFileId && files.some((f) => f.id === activeFileId && f.type === 'file')) {
            isCreatingWelcomeFile.current = false;
            return;
        }

        const fallback = pickFallbackFile(files);
        if (fallback) {
            isCreatingWelcomeFile.current = false;
            setActiveFileId(fallback.id);
            return;
        }

        // No files at all: first visit, or the last one was deleted for good
        if (isCreatingWelcomeFile.current) return;
        isCreatingWelcomeFile.current = true;
        createFileSystemEntry('Welcome file', { type: 'file', parentId: null })
            .then((entry) => setActiveFileId(entry.id));
    }, [files, activeFileId, setActiveFileId]);
}
