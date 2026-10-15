import type { TreeNode } from '@/types/file';

export function findNodeById(nodes: TreeNode[], id: string): TreeNode | null {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.type === 'folder' && node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
}