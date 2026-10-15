import { createContext, useEffect, useRef } from "react";
import type { editor } from "monaco-editor";
import { useSettings } from "@hooks/useSettings";
import { buildScrollAnchors, mapScroll, type ScrollAnchor } from "@utils/scrollSync";

type ScrollSyncContextType = {
    registerEditor: (codeEditor: editor.IStandaloneCodeEditor) => void;
    registerPreview: (element: HTMLElement | null) => (() => void) | undefined;
    invalidateAnchors: () => void;
}

export const ScrollSyncContext = createContext<ScrollSyncContextType | undefined>(undefined);

// Diferencia (px) por debajo de la cual un evento de scroll es el eco de un scroll aplicado por código
const ECHO_TOLERANCE = 1;

// Sincroniza el scroll del editor y del preview por líneas del Markdown (ver utils/scrollSync)
export const ScrollSyncProvider = ({ children }: { children: React.ReactNode }) => {
    const { settings } = useSettings();
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const previewRef = useRef<HTMLElement | null>(null);
    // Las anclas se calculan en el primer scroll y se reutilizan hasta que cambia el contenido o el tamaño de un panel
    const anchorsRef = useRef<ScrollAnchor[] | null>(null);
    // Scroll aplicado por código al preview: su evento llega en el siguiente frame y se ignora una sola vez
    const previewEchoRef = useRef<number | null>(null);
    // Monaco emite onDidScrollChange de forma síncrona: mientras se aplica el scroll se ignoran sus eventos
    const applyingEditorScrollRef = useRef(false);
    // Los listeners se registran una sola vez: leen el ajuste desde una ref para ver siempre el valor actual
    const enabledRef = useRef(settings.workspace.syncScroll);

    useEffect(() => {
        enabledRef.current = settings.workspace.syncScroll;
    }, [settings.workspace.syncScroll]);

    const invalidateAnchors = () => {
        anchorsRef.current = null;
    };

    const getAnchors = (codeEditor: editor.IStandaloneCodeEditor, preview: HTMLElement) => {
        if (!anchorsRef.current) anchorsRef.current = buildScrollAnchors(codeEditor, preview);
        return anchorsRef.current;
    };

    const syncFromEditor = () => {
        const codeEditor = editorRef.current;
        const preview = previewRef.current;
        if (!enabledRef.current || !codeEditor || !preview) return;

        const previous = preview.scrollTop;
        preview.scrollTop = mapScroll(getAnchors(codeEditor, preview), codeEditor.getScrollTop(), "editor", "preview");
        // Solo hay evento si la posición cambia (el navegador puede redondearla: se guarda la aplicada de verdad)
        if (preview.scrollTop !== previous) previewEchoRef.current = preview.scrollTop;
    };

    const syncFromPreview = () => {
        const codeEditor = editorRef.current;
        const preview = previewRef.current;
        if (!enabledRef.current || !codeEditor || !preview) return;

        applyingEditorScrollRef.current = true;
        try {
            codeEditor.setScrollTop(mapScroll(getAnchors(codeEditor, preview), preview.scrollTop, "preview", "editor"));
        } finally {
            applyingEditorScrollRef.current = false;
        }
    };

    const registerEditor = (codeEditor: editor.IStandaloneCodeEditor) => {
        editorRef.current = codeEditor;
        invalidateAnchors();

        // Monaco libera estos listeners al destruir el editor
        codeEditor.onDidScrollChange((e) => {
            if (!e.scrollTopChanged || applyingEditorScrollRef.current) return;
            syncFromEditor();
        });
        // Cambiar el contenido, el ajuste de línea o el tamaño del editor mueve las líneas
        codeEditor.onDidContentSizeChange(invalidateAnchors);
        codeEditor.onDidLayoutChange(invalidateAnchors);
    };

    // Ref callback del contenedor con scroll del preview (devuelve su limpieza, React 19)
    const registerPreview = (element: HTMLElement | null) => {
        previewRef.current = element;
        invalidateAnchors();
        if (!element) return;

        const handleScroll = () => {
            const echo = previewEchoRef.current;
            previewEchoRef.current = null;
            if (echo !== null && Math.abs(element.scrollTop - echo) < ECHO_TOLERANCE) return;
            syncFromPreview();
        };
        // Imágenes que terminan de cargar, cambios de ancho del panel...: cualquier cambio de tamaño mueve los bloques
        const resizeObserver = new ResizeObserver(invalidateAnchors);
        resizeObserver.observe(element);
        if (element.firstElementChild) resizeObserver.observe(element.firstElementChild);
        element.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            element.removeEventListener("scroll", handleScroll);
            resizeObserver.disconnect();
            previewRef.current = null;
        };
    };

    return (
        <ScrollSyncContext.Provider value={{ registerEditor, registerPreview, invalidateAnchors }}>
            {children}
        </ScrollSyncContext.Provider>
    );
};
