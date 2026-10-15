import { useEffect, useRef } from 'react';
import { useFiles } from './useFiles';
import { useActiveFile } from '../useActiveFile';
import { db } from '@helpers/db';
import { createFileSystemEntry } from '@helpers/createEntry';
import { ensureSystemFolders } from '@helpers/systemFolders';
import { pickFallbackFile } from '@helpers/fallbackFile';

/**
 * Keeps the file system usable at all times:
 * - The system folders (Images and Trash) always exist
 * - There's always an active file, so the editor is never left empty:
 *   if the active one is missing (app start, deleted for good...) the most recently edited file is opened,
 *   preferring the ones outside Trash; if there are no files at all, one is created:
 *   a welcome file on the first visit, or a blank new file once the last one has been deleted for good
 */
export function useEnsureFileSystem() {
    // Live-queried list of entries from Dexie (undefined while loading).
    const files = useFiles();
    const { activeFileId, setActiveFileId } = useActiveFile();
    const hasEnsuredFolders = useRef(false);
    // A file is being created: the live query may not include it yet, so no other one is created meanwhile
    const isCreatingFile = useRef(false);
    // Whether there has been any file this session: running out of files then means the last one was deleted
    const hadFiles = useRef(false);

    useEffect(() => {
        if (hasEnsuredFolders.current) return;
        hasEnsuredFolders.current = true;
        ensureSystemFolders();
    }, []);

    useEffect(() => {
        // Dexie hasn't resolved the query yet — wait for real data.
        if (files === undefined) return;
        if (files.some((f) => f.type === 'file')) hadFiles.current = true;

        if (activeFileId && files.some((f) => f.id === activeFileId && f.type === 'file')) {
            isCreatingFile.current = false;
            return;
        }

        const replaceActiveFile = () => {
            const fallback = pickFallbackFile(files);
            if (fallback) {
                isCreatingFile.current = false;
                setActiveFileId(fallback.id);
                return;
            }

            // No files at all: first visit, or the last one was deleted for good
            if (isCreatingFile.current) return;
            isCreatingFile.current = true;
            createFileSystemEntry(hadFiles.current ? 'New file' : 'Welcome file', { type: 'file', parentId: null })
                .then((entry) => setActiveFileId(entry.id));
        };

        if (!activeFileId) {
            replaceActiveFile();
            return;
        }

        // A file opened right after being added (e.g. imported) may not be in the live query's results yet:
        // it's only replaced if it's really gone. Once the query catches up, this effect finds it.
        let cancelled = false;
        db.entries.get(activeFileId).then((entry) => {
            if (!cancelled && entry?.type !== 'file') replaceActiveFile();
        });
        return () => { cancelled = true; };
    }, [files, activeFileId, setActiveFileId]);
}
