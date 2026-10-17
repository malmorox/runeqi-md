import { MAX_LISTED_REJECTIONS } from '@constants/alerts';

// One line per rejected file; past a few, the rest are summed up so the alert stays short
export function listRejections(errors: string[]) {
    const listed = errors.slice(0, MAX_LISTED_REJECTIONS);
    const rest = errors.length - listed.length;
    return (rest > 0 ? [...listed, `…and ${rest} more.`] : listed).join('\n');
}

// Dexie wraps the browser's own errors: the original one is in `inner`
function isQuotaExceeded(error: unknown) {
    let current = error;
    for (let depth = 0; current && depth < 5; depth++) {
        if ((current as { name?: unknown }).name === 'QuotaExceededError') return true;
        current = (current as { inner?: unknown }).inner;
    }
    return false;
}

// Explains an unexpected failure of the browser's storage (IndexedDB), where all the files live.
// The error itself stays in the console for debugging
export function storageErrorMessage(error: unknown) {
    console.error(error);
    return isQuotaExceeded(error)
        ? 'The browser is out of storage space for this site. Free some up (e.g. empty the Trash or delete unused images) and try again.'
        : "The browser's storage didn't respond. Try again, and export your important files to keep a copy.";
}
