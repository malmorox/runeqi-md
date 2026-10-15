export const PENDING_NODE_ID = '__pending-node__';
export const TRASH_ID = '__trash__';
export const IMAGES_ID = '__images__';
// Name of the Images system folder: Markdown references images as `/Images/<name>`
export const IMAGES_FOLDER_NAME = 'Images';

// Accepted image formats, mapped to the extension used when a pasted image has no name
export const IMAGE_EXTENSIONS: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
};
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
