import Dexie, { type Table } from 'dexie';
import type { FileSystemEntry } from '@/types/file';

const LEGACY_TEMP_ID = '__temp__';

class RuneQiDB extends Dexie {
    entries!: Table<FileSystemEntry, string>;

    constructor() {
        super('runeqi-md');
        this.version(1).stores({
            entries: 'id, parentId, type, name',
        });
        // v2 drops the old Temp system folder: whatever was inside it moves to the root
        this.version(2).stores({
            entries: 'id, parentId, type, name',
        }).upgrade(async (tx) => {
            const entries = tx.table<FileSystemEntry, string>('entries');
            await entries.where('parentId').equals(LEGACY_TEMP_ID).modify({ parentId: null });
            await entries.delete(LEGACY_TEMP_ID);
        });
    }
}

export const db = new RuneQiDB();