import { useEffect, useMemo } from 'react';
import { db } from '@helpers/db';
import { debounce } from '@utils/debounce';
import { persistFileToDb } from '@helpers/persistFile';
import { useMarkdown } from '@hooks/useMarkdown';
import { useAlerts } from '@hooks/useAlerts';
import { storageErrorMessage } from '@utils/alertMessages';

export function useFileContent(activeFileId: string | null, onLoad: (content: string) => void) {
    const { setMarkdown } = useMarkdown();
    const alerts = useAlerts();

    // A failed save would otherwise go unnoticed: the text stays in the editor but would be lost on reload.
    // While it keeps failing, the same alert is shown again instead of a new one per change
    const persistFile = useMemo(() => debounce((id: string, content: string) => {
        persistFileToDb(id, content).catch((error) => {
            alerts.error({ title: "Your changes couldn't be saved", message: storageErrorMessage(error) });
        });
    }, 400), [alerts]);

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