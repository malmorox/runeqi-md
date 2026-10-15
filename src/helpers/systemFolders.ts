import { db } from './db';
import { TRASH_ID, IMAGES_ID, IMAGES_FOLDER_NAME } from '@constants/fileSystem';
import type { FileSystemEntry } from '@/types/file';

const SYSTEM_FOLDERS = [
    { id: TRASH_ID, name: 'Trash' },
    { id: IMAGES_ID, name: IMAGES_FOLDER_NAME },
];

// System folders are fixed: they can't be renamed, deleted or moved
export function isSpecialFolderId(id: string): boolean {
    return SYSTEM_FOLDERS.some((folder) => folder.id === id);
}

// Walks up the parentId chain to find the system folder an entry lives in (or the entry itself, if it is one).
// Returns null if it isn't inside any (or the entry doesn't exist).
export function getContainingSpecialFolder(entryId: string | null, entries: FileSystemEntry[]): string | null {
    if (!entryId) return null;
    const map = new Map(entries.map((e) => [e.id, e]));
    let current = map.get(entryId);

    while (current) {
        if (isSpecialFolderId(current.id)) return current.id;
        if (!current.parentId) return null;
        current = map.get(current.parentId);
    }
    return null;
}

// Creates the system folders as fixed, top-level folders if they don't exist yet.
// Safe to call on every app start — no-ops for the ones already there.
export async function ensureSystemFolders() {
    const existing = await db.entries.bulkGet(SYSTEM_FOLDERS.map((folder) => folder.id));
    const now = Date.now();
    const missing = SYSTEM_FOLDERS.filter((_, i) => !existing[i]);
    if (missing.length === 0) return;

    await db.entries.bulkAdd(missing.map(({ id, name }) => ({
        id,
        name,
        type: 'folder' as const,
        parentId: null,
        createdAt: now,
        updatedAt: now,
    })));
}
