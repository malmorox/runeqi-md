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
            data-selected={isSelected || undefined}
            className="tree-row"
        >
            {isFolder ? (
                node.isOpen
                    ? <GoTriangleDown size={14} />
                    : <GoTriangleRight size={14} />
            ) : node.data.type === 'image' ? (
                <HiOutlinePhoto size={14} aria-hidden />
            ) : (
                <span className="tree-row-spacer" />
            )}
            {/* Long names end in "…" (the full name shows on hover) */}
            <span className="tree-row-name">{node.data.name}</span>
        </div>
    );
};

export default FileTreeRow;
