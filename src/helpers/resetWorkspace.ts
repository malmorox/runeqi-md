import { db } from './db';
import { ensureSystemFolders } from './systemFolders';
import { createWelcomeFile } from './createEntry';

// Permanently deletes every file, folder and image (Trash included) and starts over like on the first visit:
// the system folders and the welcome file. It's one transaction, so the app never sees an empty workspace in
// between (it would create a blank file of its own) and nothing is lost if it fails halfway.
// Returns the ids of the deleted entries, whose editor models can then be disposed, and the new welcome file.
export async function resetWorkspace() {
    return db.transaction('rw', db.entries, async () => {
        const deletedIds = await db.entries.toCollection().primaryKeys();
        await db.entries.clear();
        await ensureSystemFolders();
        const welcomeFile = await createWelcomeFile();
        return { deletedIds, welcomeFile };
    });
}
