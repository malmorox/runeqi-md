import type { TreeNode, PendingNodeInfo } from '@/types/file';
import { PENDING_NODE_ID } from '@constants/fileSystem';

export const insertPendingNode = (
    nodes: TreeNode[],
    pending: PendingNodeInfo
): TreeNode[] => {
    const placeholder: TreeNode = {
        id: PENDING_NODE_ID,
        name: '',
        type: pending.type,
        parentId: pending.parentId,
        createdAt: 0,
        updatedAt: 0,
        children: pending.type === 'folder' ? [] : undefined,
    };

    if (pending.parentId === null) {
        return [...nodes, placeholder];
    }

    return nodes.map((node) =>
        node.id === pending.parentId
            ? { ...node, children: [...(node.children ?? []), placeholder] }
            : node
    );
}