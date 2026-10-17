import { db } from './db';
import { MARKDOWN_EXTENSIONS, MAX_MARKDOWN_SIZE } from '@constants/fileSystem';
import type { FileSystemEntry } from '@/types/file';

// Expected failures (not a Markdown file, too big): their message is meant to be shown to the user
export class MarkdownImportError extends Error {}

export const ACCEPTED_MARKDOWN_TYPES = MARKDOWN_EXTENSIONS.join(',');

const MARKDOWN_FILE = new RegExp(`(${MARKDOWN_EXTENSIONS.map((ext) => `\\${ext}`).join('|')})$`, 'i');
// Characters that aren't allowed in file names on some systems (Windows is the strictest)
const INVALID_FILE_NAME_CHARS = /[<>:"/\\|?*\p{Cc}]/gu;

// "notes" -> "notes-1", "notes-2"... until it doesn't clash with another file at the root
function uniqueName(name: string, taken: Set<string>) {
    if (!taken.has(name)) return name;
    let i = 1;
    while (taken.has(`${name}-${i}`)) i++;
    return `${name}-${i}`;
}

// Adds a Markdown file from the computer as a new file at the root, named without its extension
// like the ones created in the app ("notes.md" -> "notes").
// Throws MarkdownImportError if it isn't a Markdown file or it's too big.
export async function importMarkdownFile(file: File): Promise<FileSystemEntry> {
    if (!MARKDOWN_FILE.test(file.name)) {
        throw new MarkdownImportError(`"${file.name}" isn't a Markdown file (${MARKDOWN_EXTENSIONS.join(' or ')}).`);
    }
    if (file.size > MAX_MARKDOWN_SIZE) {
        throw new MarkdownImportError(`"${file.name}" is larger than ${MAX_MARKDOWN_SIZE / 1024 / 1024} MB.`);
    }

    // Read before the transaction: awaiting anything else inside it would commit it early.
    // Windows line endings are normalized, so the editor and the preview always get "\n"
    const content = (await file.text()).replace(/\r\n?/g, '\n');
    const name = file.name.replace(MARKDOWN_FILE, '').trim() || 'Imported file';

    // Reading the taken names and adding the entry in one transaction keeps names unique across concurrent imports
    return db.transaction('rw', db.entries, async () => {
        // parentId isn't indexed when it's null (root entries), so they're filtered instead of queried
        const rootFiles = await db.entries.filter((e) => e.parentId === null && e.type === 'file').toArray();
        const now = Date.now();
        const entry: FileSystemEntry = {
            id: crypto.randomUUID(),
            name: uniqueName(name, new Set(rootFiles.map((f) => f.name))),
            type: 'file',
            parentId: null,
            content,
            createdAt: now,
            updatedAt: now,
        };
        await db.entries.add(entry);
        return entry;
    });
}

// Imports several files, keeping going past the ones that are rejected
export async function importMarkdownFiles(files: File[]) {
    const saved: FileSystemEntry[] = [];
    const errors: string[] = [];
    for (const file of files) {
        try {
            saved.push(await importMarkdownFile(file));
        } catch (error) {
            if (!(error instanceof MarkdownImportError)) throw error;
            errors.push(error.message);
        }
    }
    return { saved, errors };
}

// Name a file is downloaded with: "My notes" -> "My notes.md".
// Characters not allowed in file names become "-", and the extension isn't repeated if the name already has one.
export function markdownFileName(name: string) {
    const safeName = name.replace(INVALID_FILE_NAME_CHARS, '-').trim().replace(/[. ]+$/, '') || 'document';
    return MARKDOWN_FILE.test(safeName) ? safeName : `${safeName}.md`;
}

// File System Access API: only in Chromium browsers (Chrome, Edge...) and not in TypeScript's DOM types yet
type SaveFilePicker = (options: {
    suggestedName?: string;
    types?: { description: string; accept: Record<string, string[]> }[];
}) => Promise<FileSystemFileHandle>;

// Saves the content as a .md file on the computer. Where the browser allows it, the app opens the system's
// "Save as" dialog itself, so it knows when the file has really been saved (and with which name).
// Elsewhere (Firefox, Safari) it's handed to the browser as a download, and whether it ends up saved is unknown.
// Returns null if the dialog was closed without saving.
export async function exportMarkdown(name: string, content: string) {
    const fileName = markdownFileName(name);
    const showSaveFilePicker = (window as Window & { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker;
    if (!showSaveFilePicker) {
        downloadMarkdown(name, content);
        return { fileName, downloaded: true };
    }

    let handle: FileSystemFileHandle;
    try {
        handle = await showSaveFilePicker({
            suggestedName: fileName,
            types: [{ description: 'Markdown', accept: { 'text/markdown': MARKDOWN_EXTENSIONS } }],
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return null;
        // The dialog isn't allowed here (e.g. inside an iframe): the download still works
        downloadMarkdown(name, content);
        return { fileName, downloaded: true };
    }

    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return { fileName: handle.name, downloaded: false };
}

// Downloads the content as a .md file to the computer
export function downloadMarkdown(name: string, content: string) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = markdownFileName(name);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
