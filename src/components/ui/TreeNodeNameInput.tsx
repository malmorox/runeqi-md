import type { CSSProperties } from 'react';
import { HiChevronRight, HiChevronDown } from 'react-icons/hi2';
import type { FileSystemEntryType } from '@/types/file';

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

    return (
        <div style={style} className="h-full box-border px-2 flex items-center gap-1 text-sm leading-5">
            {isFolder ? (
                isOpen ? <HiChevronDown size={14} /> : <HiChevronRight size={14} />
            ) : (
                <span className="w-3.5 shrink-0" />
            )}
            <input
                autoFocus
                defaultValue={defaultValue}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 bg-white text-black text-sm px-1 py-0.5 rounded outline-none border border-[#888]"
                onBlur={(e) => onConfirm(e.currentTarget.value)}
                onKeyDown={(e) => {
                    e.stopPropagation();

                    if (e.key === 'Enter') {
                        e.preventDefault();
                        onConfirm(e.currentTarget.value);
                    }
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        onCancel();
                    }
                }}
            />
        </div>
    );
};

export default TreeNodeNameInput;