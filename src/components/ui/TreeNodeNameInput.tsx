import type { CSSProperties } from 'react';
import { HiChevronRight, HiChevronDown } from 'react-icons/hi2';
import type { FileSystemEntryType } from '@/types/file';
import { splitExtension } from '@utils/imagePaths';

interface TreeNodeNameInputProps {
    type: FileSystemEntryType;
    style: CSSProperties;
    isOpen?: boolean;
    defaultValue?: string;
    onConfirm: (name: string) => void;
    onCancel: () => void;
}

const TreeNodeNameInput = ({ type, style, isOpen = false, defaultValue = '', onConfirm, onCancel }: TreeNodeNameInputProps) => {
    const isFolder = type === 'folder';
    // Images keep their extension: only the base name is editable
    const { base, ext } = type === 'image' ? splitExtension(defaultValue) : { base: defaultValue, ext: '' };

    const confirm = (value: string) => {
        if (!ext) {
            onConfirm(value);
            return;
        }
        const trimmed = value.trim();
        onConfirm(trimmed ? trimmed + ext : '');
    };

    return (
        <div style={style} className="h-full box-border px-2 flex items-center gap-1 text-sm leading-5">
            {isFolder ? (
                isOpen ? <HiChevronDown size={14} /> : <HiChevronRight size={14} />
            ) : (
                <span className="w-3.5 shrink-0" />
            )}
            <input
                autoFocus
                defaultValue={base}
                aria-label={ext ? `Image name (extension ${ext} is kept)` : undefined}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 bg-white text-black text-sm px-1 py-0.5 rounded outline-none border border-[#888]"
                onBlur={(e) => confirm(e.currentTarget.value)}
                onKeyDown={(e) => {
                    e.stopPropagation();

                    if (e.key === 'Enter') {
                        e.preventDefault();
                        confirm(e.currentTarget.value);
                    }
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        onCancel();
                    }
                }}
            />
            {ext && (
                <span aria-hidden="true" className="shrink-0 text-sm">
                    {ext}
                </span>
            )}
        </div>
    );
};

export default TreeNodeNameInput;
