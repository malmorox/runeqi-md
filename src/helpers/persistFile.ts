import { db } from '@helpers/db';

export async function persistFileToDb(id: string, content: string) {
    await db.entries.update(id, { content, updatedAt: Date.now() });
}