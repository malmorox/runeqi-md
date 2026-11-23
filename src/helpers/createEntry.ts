import { db } from './db';
import { DEFAULT_FILE_CONTENT } from '@constants/editor';
import WELCOME_FILE_CONTENT from '@constants/welcomeFile.md?raw';
import type { FileSystemEntry, PendingNodeInfo } from '@/types/file';

// `content` is only used for files; without it they start with the default content
export async function createFileSystemEntry(name: string, pending: PendingNodeInfo, content = DEFAULT_FILE_CONTENT): Promise<FileSystemEntry> {
    const entry: FileSystemEntry = {
        id: crypto.randomUUID(),
        name,
        type: pending.type,
        parentId: pending.parentId,
        content: pending.type === 'file' ? content : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await db.entries.add(entry);
    return entry;
}
// File that introduces the editor, at the root: created on the first visit and when the workspace is reset
export const createWelcomeFile = () =>
    createFileSystemEntry('Welcome file', { type: 'file', parentId: null }, WELCOME_FILE_CONTENT);
