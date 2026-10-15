import { db } from './db';

export async function renameFileSystemEntry(id: string, name: string) {
    await db.entries.update(id, { name, updatedAt: Date.now() });
}