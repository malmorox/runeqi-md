import { createContext, useRef } from "react";

type ScrollSyncContextType = {
    setEditorScroll: (percentage: number) => void;
    setPreviewScroll: (percentage: number) => void;
    onEditorScroll: (cb: (percentage: number) => void) => void;
    onPreviewScroll: (cb: (percentage: number) => void) => void;
}

export const ScrollSyncContext = createContext<ScrollSyncContextType | undefined>(undefined);

export const ScrollSyncProvider = ({ children }: { children: React.ReactNode }) => {
    const editorCb = useRef<((p: number) => void) | null>(null);
    const previewCb = useRef<((p: number) => void) | null>(null);

    const setEditorScroll = (percentage: number) => {
        previewCb.current?.(percentage);
    };

    const setPreviewScroll = (percentage: number) => {
        editorCb.current?.(percentage);
    };

    const onEditorScroll = (cb: (p: number) => void) => {
        editorCb.current = cb;
    };

    const onPreviewScroll = (cb: (p: number) => void) => {
        previewCb.current = cb;
    };

    return (
        <ScrollSyncContext.Provider value={{ setEditorScroll, setPreviewScroll, onEditorScroll, onPreviewScroll }}>
            {children}
        </ScrollSyncContext.Provider>
    );
};