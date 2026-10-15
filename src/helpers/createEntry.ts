import { db } from './db';
import { DEFAULT_FILE_CONTENT } from '@constants/editor';
import type { FileSystemEntry, PendingNodeInfo } from '@/types/file';

export async function createFileSystemEntry(name: string, pending: PendingNodeInfo): Promise<FileSystemEntry> {
    const entry: FileSystemEntry = {
        id: crypto.randomUUID(),
        name,
        type: pending.type,
        parentId: pending.parentId,
        content: pending.type === 'file' ? DEFAULT_FILE_CONTENT : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await db.entries.add(entry);
    return entry;
}