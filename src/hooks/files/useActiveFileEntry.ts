import { useFiles } from './useFiles';
import { useActiveFile } from '../useActiveFile';

export function useActiveFileEntry() {
    const files = useFiles();
    const { activeFileId } = useActiveFile();
    return files?.find((f) => f.id === activeFileId) ?? null;
}