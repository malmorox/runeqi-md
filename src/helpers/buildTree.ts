import type { FileSystemEntry, TreeNode } from '@/types/file';
import { TRASH_ID, IMAGES_ID } from '@constants/fileSystem';

export function buildTree(nodes: FileSystemEntry[]): TreeNode[] {
    const map = new Map<string, TreeNode>();
    nodes.forEach(n =>
        map.set(n.id, { ...n, children: n.type === 'folder' ? [] : undefined })
    );

    const roots: TreeNode[] = [];
    nodes.forEach(n => {
        const node = map.get(n.id)!;
        if (n.parentId === null) {
            roots.push(node);
        } else {
            map.get(n.parentId)?.children?.push(node);
        }
    });

    const specialOrder = [TRASH_ID, IMAGES_ID];
    roots.sort((a, b) => {
        const ai = specialOrder.indexOf(a.id);
        const bi = specialOrder.indexOf(b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });

    return roots;
}