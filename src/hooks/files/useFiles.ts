import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@helpers/db';

export function useFiles() {
    return useLiveQuery(() => db.entries.toArray(), []);
}