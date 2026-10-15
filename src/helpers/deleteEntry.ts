import { db } from './db';
import { TRASH_ID } from '@constants/fileSystem';
import type { FileSystemEntry } from '@/types/file';

export function collectDescendantIds(id: string, allEntries: FileSystemEntry[]): string[] {
    const children = allEntries.filter((e) => e.parentId === id);
    let ids: string[] = [];
    for (const child of children) {
        ids.push(child.id);
        if (child.type === 'folder') {
            ids = ids.concat(collectDescendantIds(child.id, allEntries));
        }
    }
    return ids;
}

// Moves an entry (and, if it's a folder, everything inside it stays nested
// under it) into Trash. Reversible — nothing is actually deleted.
export async function moveToTrash(id: string) {
    await db.entries.update(id, { parentId: TRASH_ID, updatedAt: Date.now() });
}

// Permanently deletes an entry and all its descendants.
export async function hardDeleteEntry(id: string) {
    const allEntries = await db.entries.toArray();
    const descendantIds = collectDescendantIds(id, allEntries);
    await db.entries.bulkDelete([id, ...descendantIds]);
}

// Permanently deletes everything INSIDE a folder, but keeps the folder itself.
// Used for "empty Trash".
export async function emptyFolder(folderId: string) {
    const allEntries = await db.entries.toArray();
    const descendantIds = collectDescendantIds(folderId, allEntries);
    await db.entries.bulkDelete(descendantIds);
}