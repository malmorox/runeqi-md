import type { RefObject } from 'react';
import { Tree, type TreeApi } from 'react-arborist';
import { insertPendingNode } from '@helpers/insertPendingNode';
import { isSpecialFolderId } from '@helpers/systemFolders';
import TreeNodeNameInput from '@components/ui/TreeNodeNameInput';
import FileTreeRow from '@components/fileExplorer/FileTreeRow';
import type { TreeNode, PendingNodeInfo } from '@/types/file';
import { PENDING_NODE_ID } from '@constants/fileSystem';

interface FileTreeProps {
    treeData: TreeNode[];
    treeApiRef: RefObject<TreeApi<TreeNode> | null>;
    height: number;
    selectedNodeId: string | undefined;
    pendingNode: PendingNodeInfo | null;
    renamingNodeId: string | null;
    onSelectNode: (node: TreeNode | null) => void;
    onConfirmPendingNode: (name: string) => void;
    onDiscardPendingNode: () => void;
    onConfirmRename: (name: string) => void;
    onCancelRename: () => void;
}

const FileTree = ({
    treeData,
    treeApiRef,
    height,
    selectedNodeId,
    pendingNode,
    renamingNodeId,
    onSelectNode,
    onConfirmPendingNode,
    onDiscardPendingNode,
    onConfirmRename,
    onCancelRename
}: FileTreeProps) => {
    // Injects a temporary placeholder node into the tree while creating a new file/folder
    const displayTreeData = pendingNode
        ? insertPendingNode(treeData, pendingNode)
        : treeData;

    return (
        <Tree<TreeNode>
            data={displayTreeData}
            openByDefault={false}
            ref={treeApiRef}
            rowHeight={24}
            width="100%"
            height={height}
            rowClassName="tree-row-wrapper"
            disableDrag={(data) => isSpecialFolderId(data.id)}
            onSelect={(nodes) => {
                const node = nodes[0]?.data ?? null;
                // Ignore selection events for the temporary placeholder node
                if (node?.id === PENDING_NODE_ID) return;
                onSelectNode(node);
            }}
        >
            {({ node, style, dragHandle }) => {
                if (node.data.id === PENDING_NODE_ID) {
                    return (
                        <TreeNodeNameInput
                            type={pendingNode!.type}
                            style={style}
                            isOpen={node.isOpen}
                            onConfirm={onConfirmPendingNode}
                            onCancel={onDiscardPendingNode}
                        />
                    );
                }

                if (node.data.id === renamingNodeId) {
                    return (
                        <TreeNodeNameInput
                            type={node.data.type}
                            style={style}
                            isOpen={node.isOpen}
                            defaultValue={node.data.name}
                            onConfirm={onConfirmRename}
                            onCancel={onCancelRename}
                        />
                    );
                }

                return (
                    <FileTreeRow
                        node={node}
                        style={style}
                        dragHandle={dragHandle}
                        isSelected={node.data.id === selectedNodeId}
                    />
                );
            }}
        </Tree>
    );
};

export default FileTree;
