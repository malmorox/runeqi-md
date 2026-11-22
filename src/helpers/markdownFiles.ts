import { db } from './db';
import { fileNameFor, saveFile, type FileFormat } from './saveFile';
import { MARKDOWN_EXTENSIONS, MAX_MARKDOWN_SIZE } from '@constants/fileSystem';
import type { FileSystemEntry } from '@/types/file';

// Expected failures (not a Markdown file, too big): their message is meant to be shown to the user
export class MarkdownImportError extends Error {}

export const ACCEPTED_MARKDOWN_TYPES = MARKDOWN_EXTENSIONS.join(',');

const MARKDOWN_FILE = new RegExp(`(${MARKDOWN_EXTENSIONS.map((ext) => `\\${ext}`).join('|')})$`, 'i');

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

export const MARKDOWN_FORMAT: FileFormat = {
    extension: '.md',
    extensions: MARKDOWN_EXTENSIONS,
    mimeType: 'text/markdown',
    description: 'Markdown',
};

// Name a file is exported with: "My notes" -> "My notes.md"
export const markdownFileName = (name: string) => fileNameFor(name, MARKDOWN_FORMAT);

// Saves the content as a .md file on the computer (see saveFile). Returns null if the dialog was closed without saving
export const exportMarkdown = (name: string, content: string) => saveFile(name, content, MARKDOWN_FORMAT);
