export interface FileFormat {
    // Added to the name when it doesn't already end with one of `extensions`
    extension: string;
    extensions: string[];
    mimeType: string;
    // Shown in the "Save as" dialog's file type list
    description: string;
}

// Characters that aren't allowed in file names on some systems (Windows is the strictest)
const INVALID_FILE_NAME_CHARS = /[<>:"/\\|?*\p{Cc}]/gu;

// Name a file is saved with: "My notes" -> "My notes.md".
// Characters not allowed in file names become "-", and the extension isn't repeated if the name already has one.
export function fileNameFor(name: string, format: FileFormat) {
    const safeName = name.replace(INVALID_FILE_NAME_CHARS, '-').trim().replace(/[. ]+$/, '') || 'document';
    const lowerName = safeName.toLowerCase();
    return format.extensions.some((ext) => lowerName.endsWith(ext)) ? safeName : `${safeName}${format.extension}`;
}

// File System Access API: only in Chromium browsers (Chrome, Edge...) and not in TypeScript's DOM types yet
type SaveFilePicker = (options: {
    suggestedName?: string;
    types?: { description: string; accept: Record<string, string[]> }[];
}) => Promise<FileSystemFileHandle>;

// Saves the content as a file on the computer. Where the browser allows it, the app opens the system's
// "Save as" dialog itself, so it knows when the file has really been saved (and with which name).
// Elsewhere (Firefox, Safari) it's handed to the browser as a download, and whether it ends up saved is unknown.
// Returns null if the dialog was closed without saving.
export async function saveFile(name: string, content: string, format: FileFormat) {
    const fileName = fileNameFor(name, format);
    const showSaveFilePicker = (window as Window & { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker;
    if (!showSaveFilePicker) {
        downloadFile(fileName, content, format);
        return { fileName, downloaded: true };
    }

    let handle: FileSystemFileHandle;
    try {
        handle = await showSaveFilePicker({
            suggestedName: fileName,
            types: [{ description: format.description, accept: { [format.mimeType]: format.extensions } }],
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return null;
        // The dialog isn't allowed here (e.g. inside an iframe): the download still works
        downloadFile(fileName, content, format);
        return { fileName, downloaded: true };
    }

    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return { fileName: handle.name, downloaded: false };
}

// Downloads the content as a file to the computer
function downloadFile(fileName: string, content: string, format: FileFormat) {
    const blob = new Blob([content], { type: `${format.mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
