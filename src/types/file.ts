export type FileSystemEntryType = 'file' | 'folder' | 'image';

export interface FileSystemEntry {
    id: string;
    name: string;
    type: FileSystemEntryType;
    parentId: string | null;
    content?: string;
    // Image data (only for `image` entries)
    blob?: Blob;
    createdAt: number;
    updatedAt: number;
}

export interface TreeNode extends FileSystemEntry {
    children?: TreeNode[];
}

export interface PendingNodeInfo {
    type: 'file' | 'folder';
    parentId: string | null;
}
