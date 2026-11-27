import { useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { HiDocumentPlus, HiFolderPlus } from 'react-icons/hi2';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { RiImageAddFill } from "react-icons/ri";
import { ACCEPTED_IMAGE_TYPES } from '@helpers/images';

interface FileExplorerToolbarProps {
    isBusy: boolean;
    canRename: boolean;
    // What the delete button does for the selection (null: nothing to delete)
    deleteLabel: string | null;
    hasSelection: boolean;
    showUploadImages: boolean;
    onCreateFile: () => void;
    onCreateFolder: () => void;
    onUploadImages: (files: FileList | null) => void;
    onRename: () => void;
    onDelete: () => void;
    onClose: () => void;
}

const FileExplorerToolbar = ({
    isBusy,
    canRename,
    deleteLabel,
    hasSelection,
    showUploadImages,
    onCreateFile,
    onCreateFolder,
    onUploadImages,
    onRename,
    onDelete,
    onClose
}: FileExplorerToolbarProps) => {
    const imageInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="panel-header">
            <button
                onClick={onCreateFile}
                disabled={isBusy}
                className="panel-icon-button"
                title="New file"
            >
                <HiDocumentPlus size={20} />
            </button>
            <button
                onClick={onCreateFolder}
                disabled={isBusy}
                className="panel-icon-button"
                title="New folder"
            >
                <HiFolderPlus size={20} />
            </button>
            {showUploadImages && (
                <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isBusy}
                    className="panel-icon-button"
                    title="Upload images"
                >
                    <RiImageAddFill size={20} />
                </button>
            )}
            <input
                ref={imageInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                multiple
                hidden
                onChange={(e) => {
                    onUploadImages(e.currentTarget.files);
                    // Allows picking the same file again
                    e.currentTarget.value = '';
                }}
            />
            <button
                onClick={onRename}
                disabled={isBusy || !canRename}
                className="panel-icon-button"
                title="Rename selected"
            >
                <FaPencilAlt size={18} />
            </button>
            <button
                onClick={onDelete}
                disabled={isBusy || !hasSelection || !deleteLabel}
                className="panel-icon-button"
                title={deleteLabel ?? 'Delete selected'}
            >
                <FaTrash size={18} />
            </button>
            <span className="panel-header-spacer" />
            <button 
                onClick={onClose} 
                className="panel-icon-button panel-icon-button-muted"
                title="Close explorer"
            >
                <IoClose size={25} />
            </button>
        </div>
    );
};

export default FileExplorerToolbar;
