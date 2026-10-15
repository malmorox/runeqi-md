import { db } from './db';
import { IMAGES_ID, IMAGE_EXTENSIONS, MAX_IMAGE_SIZE } from '@constants/fileSystem';
import type { FileSystemEntry } from '@/types/file';

// Expected failures (unsupported format, too big): their message is meant to be shown to the user
export class ImageImportError extends Error {}

export const ACCEPTED_IMAGE_TYPES = Object.keys(IMAGE_EXTENSIONS).join(',');

const pad = (n: number) => String(n).padStart(2, '0');

// Pasted images all arrive as "image.png": they get a timestamped name instead
function pastedImageName(type: string) {
    const d = new Date();
    const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    return `image-${date}-${time}.${IMAGE_EXTENSIONS[type]}`;
}

// "photo.png" -> "photo-1.png", "photo-2.png"... until it doesn't clash with an image already in the folder,
// so every "/Images/<name>" path points to exactly one image
function uniqueName(name: string, taken: Set<string>) {
    if (!taken.has(name)) return name;
    const dot = name.lastIndexOf('.');
    const [base, ext] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ''];
    let i = 1;
    while (taken.has(`${base}-${i}${ext}`)) i++;
    return `${base}-${i}${ext}`;
}

// Saves an image into the Images system folder.
// Throws ImageImportError if it isn't a supported image or it's too big.
export async function saveImage(file: File, { pasted = false } = {}): Promise<FileSystemEntry> {
    if (!(file.type in IMAGE_EXTENSIONS)) {
        throw new ImageImportError(`"${file.name}" isn't a supported image (PNG, JPG, GIF, WebP or SVG).`);
    }
    if (file.size > MAX_IMAGE_SIZE) {
        throw new ImageImportError(`"${file.name}" is larger than ${MAX_IMAGE_SIZE / 1024 / 1024} MB.`);
    }

    const name = pasted || !file.name.trim() ? pastedImageName(file.type) : file.name.trim();
    // Reading the taken names and adding the entry in one transaction keeps names unique across concurrent imports
    return db.transaction('rw', db.entries, async () => {
        const images = await db.entries.where('parentId').equals(IMAGES_ID).toArray();
        const now = Date.now();
        const entry: FileSystemEntry = {
            id: crypto.randomUUID(),
            name: uniqueName(name, new Set(images.map((image) => image.name))),
            type: 'image',
            parentId: IMAGES_ID,
            blob: file,
            createdAt: now,
            updatedAt: now,
        };
        await db.entries.add(entry);
        return entry;
    });
}

// Saves several images, keeping going past the ones that are rejected
export async function saveImages(files: File[], options?: { pasted?: boolean }) {
    const saved: FileSystemEntry[] = [];
    const errors: string[] = [];
    for (const file of files) {
        try {
            saved.push(await saveImage(file, options));
        } catch (error) {
            if (!(error instanceof ImageImportError)) throw error;
            errors.push(error.message);
        }
    }
    return { saved, errors };
}

// One object URL per image, reused across renders. A new one is only created (and the old one revoked)
// when the entry changes, since every Dexie query returns a new Blob instance for the same data.
const objectUrls = new Map<string, { updatedAt: number; url: string }>();

export function getImageObjectUrl(entry: FileSystemEntry & { blob: Blob }) {
    const cached = objectUrls.get(entry.id);
    if (cached?.updatedAt === entry.updatedAt) return cached.url;
    if (cached) URL.revokeObjectURL(cached.url);

    const url = URL.createObjectURL(entry.blob);
    objectUrls.set(entry.id, { updatedAt: entry.updatedAt, url });
    return url;
}
