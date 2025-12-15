import { createContext, useEffect, useState } from "react";
import type { editor } from 'monaco-editor';

type EditorContextType = {
    editorInstance: editor.IStandaloneCodeEditor | null;
    setEditorInstance: (editor: editor.IStandaloneCodeEditor) => void;
    insertMarkdown: (text: string, offset?: number) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
};

export const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
    const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const bindUndoRedoListener = (editor: editor.IStandaloneCodeEditor) => {
        const model = editor.getModel();
        if (!model) return;

        const updateState = () => {
            setCanUndo(model.canUndo());
            setCanRedo(model.canRedo());
        };

        updateState();

        return model.onDidChangeContent(() => {
            updateState();
        });
    };

    const insertMarkdown = (text: string, cursorOffset: number = 0) => {
        if (!editorInstance) return;

        const model = editorInstance.getModel();
        const selection = editorInstance.getSelection();
        if (!model || !selection) return;

        const eol = model.getEOL();
        const normalizedText = text.replace(/\r?\n/g, eol);

        const startOffset = model.getOffsetAt(selection.getStartPosition());

        editorInstance.pushUndoStop();
        editorInstance.executeEdits("toolbar", [
            {
            range: selection,
            text: normalizedText,
            forceMoveMarkers: true,
            },
        ]);
        editorInstance.pushUndoStop();

        const targetOffset = startOffset + normalizedText.length + cursorOffset;
        const targetPos = model.getPositionAt(Math.max(0, targetOffset));

        editorInstance.setPosition(targetPos);
        editorInstance.revealPositionInCenter(targetPos);
        editorInstance.focus();
    };

    const undo = () => {
        if (!editorInstance) return;
        editorInstance.trigger('toolbar', 'undo', null);
        editorInstance.focus();
    };

    const redo = () => {
        if (!editorInstance) return;
        editorInstance.trigger('toolbar', 'redo', null);
        editorInstance.focus();
    };

    useEffect(() => {
        if (!editorInstance) return;
        const disposable = bindUndoRedoListener(editorInstance);
        return () => disposable?.dispose();
    }, [editorInstance]);

    return (
        <EditorContext.Provider value={{ editorInstance, setEditorInstance, insertMarkdown, undo, redo, canUndo, canRedo }}>
            {children}
        </EditorContext.Provider>
    );
}