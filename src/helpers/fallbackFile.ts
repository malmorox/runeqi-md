import { TRASH_ID } from '@constants/fileSystem';
import type { FileSystemEntry } from '@/types/file';

// Ids of everything inside Trash, at any depth (a trashed folder keeps its contents nested)
export function getTrashedIds(entries: FileSystemEntry[]): Set<string> {
    const childrenByParent = new Map<string, string[]>();
    for (const entry of entries) {
        if (!entry.parentId) continue;
        const siblings = childrenByParent.get(entry.parentId) ?? [];
        siblings.push(entry.id);
        childrenByParent.set(entry.parentId, siblings);
    }

    const trashed = new Set<string>();
    const pending = [...(childrenByParent.get(TRASH_ID) ?? [])];
    while (pending.length) {
        const id = pending.pop()!;
        trashed.add(id);
        pending.push(...(childrenByParent.get(id) ?? []));
    }
    return trashed;
}

/**
 * File to activate when the active one goes away: the most recently edited one outside Trash,
 * or (with `allowTrash`) the most recently edited one in Trash if there's nothing else.
 * `exclude` leaves out the entries that are about to be trashed or deleted.
 */
export function pickFallbackFile(
    entries: FileSystemEntry[],
    { exclude = new Set<string>(), allowTrash = true }: { exclude?: Set<string>; allowTrash?: boolean } = {}
): FileSystemEntry | null {
    const trashed = getTrashedIds(entries);
    let best: FileSystemEntry | null = null;
    let bestInTrash: FileSystemEntry | null = null;

    for (const entry of entries) {
        if (entry.type !== 'file' || exclude.has(entry.id)) continue;
        if (trashed.has(entry.id)) {
            if (!bestInTrash || entry.updatedAt > bestInTrash.updatedAt) bestInTrash = entry;
        } else if (!best || entry.updatedAt > best.updatedAt) {
            best = entry;
        }
    }

    return best ?? (allowTrash ? bestInTrash : null);
}
