import { HiOutlinePhoto } from 'react-icons/hi2';
import { GoTriangleRight, GoTriangleDown } from "react-icons/go";
import type { NodeRendererProps } from 'react-arborist';
import type { TreeNode } from '@/types/file';

type FileTreeRowProps = Pick<NodeRendererProps<TreeNode>, 'node' | 'style' | 'dragHandle'> & {
    isSelected: boolean;
};

const FileTreeRow = ({ node, style, dragHandle, isSelected }: FileTreeRowProps) => {
    const isFolder = node.data.type === 'folder';

    return (
        <div
            style={style}
            ref={dragHandle}
            onClick={() => {
                if (isFolder) node.toggle();
            }}
            title={node.data.name}
            className={`h-full min-w-0 box-border px-2 cursor-pointer text-sm leading-5 flex items-center gap-1 ${
                isSelected ? 'bg-[#A8A8A8]' : ''
            }`}
        >
            {isFolder ? (
                node.isOpen
                    ? <GoTriangleDown size={14} className="shrink-0" />
                    : <GoTriangleRight size={14} className="shrink-0" />
            ) : node.data.type === 'image' ? (
                <HiOutlinePhoto size={14} className="shrink-0" aria-hidden />
            ) : (
                <span className="w-3.5 shrink-0" />
            )}
            {/* Long names end in "…" (the full name shows on hover) */}
            <span className="truncate">{node.data.name}</span>
        </div>
    );
};

export default FileTreeRow;
