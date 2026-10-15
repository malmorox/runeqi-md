import { IMAGES_FOLDER_NAME } from '@constants/fileSystem';

// Encodes a name so it can't break a Markdown link destination (spaces, unbalanced parentheses...)
const encodeName = (name: string) =>
    encodeURIComponent(name).replace(/[()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

// Path used in Markdown to reference an image of the Images system folder: "/Images/photo.png"
export function imageMarkdownPath(name: string) {
    return `/${IMAGES_FOLDER_NAME}/${encodeName(name)}`;
}

// Default alt text: the file name without its extension
export function imageAlt(name: string) {
    return name.replace(/\.[^.]+$/, '').replace(/[[\]]/g, '');
}

export function imageMarkdown(name: string) {
    return `![${imageAlt(name)}](${imageMarkdownPath(name)})`;
}

// Also accepts the relative forms ("Images/x.png", "./Images/x.png", "../Images/x.png")
const LOCAL_IMAGE_PATH = new RegExp(`^(?:\\.{0,2}/)*${IMAGES_FOLDER_NAME}/([^/?#]+)$`);

// Name of the image a Markdown src points to inside the Images folder, or null if it isn't a local image
export function parseImagePath(src?: string): string | null {
    const match = src?.match(LOCAL_IMAGE_PATH);
    if (!match) return null;
    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
}
