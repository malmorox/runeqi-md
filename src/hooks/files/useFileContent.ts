import { useEffect, useMemo } from 'react';
import { db } from '@helpers/db';
import { debounce } from '@utils/debounce';
import { persistFileToDb } from '@helpers/persistFile';
import { useMarkdown } from '@hooks/useMarkdown';

export function useFileContent(activeFileId: string | null, onLoad: (content: string) => void) {
    const { setMarkdown } = useMarkdown();

    const persistFile = useMemo(() => debounce(persistFileToDb, 400), []);

    useEffect(() => {
        if (!activeFileId) return;
        let cancelled = false;
        (async () => {
            const file = await db.entries.get(activeFileId);
            if (cancelled) return;
            onLoad(file?.content ?? '');
            setMarkdown(file?.content ?? '');
        })();
        return () => { cancelled = true; };
    }, [activeFileId, onLoad, setMarkdown]);

    const handleChange = (value: string) => {
        setMarkdown(value);
        if (activeFileId) persistFile(activeFileId, value);
    };

    return { handleChange };
}