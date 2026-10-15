import { createContext, useEffect, useState, useRef, useCallback } from "react";
import type { editor } from 'monaco-editor';
import type { Monaco } from '@monaco-editor/react';

type EditorContextType = {
    editorInstance: editor.IStandaloneCodeEditor | null;
    setEditorInstance: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
    insertMarkdown: (text: string, offset?: number) => void;
    undo: () => void;
    redo: () => void;
    clearEditor: () => void;
    canUndo: boolean;
    canRedo: boolean;
    loadFileModel: (fileId: string, content: string) => void;
    disposeFileModel: (fileId: string) => void;
};

export const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
    const [editorInstance, setEditorInstanceState] = useState<editor.IStandaloneCodeEditor | null>(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const monacoRef = useRef<Monaco | null>(null);
    const modelsRef = useRef<Map<string, editor.ITextModel>>(new Map());
    // Models of deleted files that the editor is still showing: they're disposed once the next file is loaded
    const orphanModelsRef = useRef<editor.ITextModel[]>([]);
    const undoRedoDisposableRef = useRef<{ dispose: () => void } | null>(null);

    const bindUndoRedoListener = (model: editor.ITextModel) => {
        undoRedoDisposableRef.current?.dispose();

        const updateState = () => {
            setCanUndo(model.canUndo());
            setCanRedo(model.canRedo());
        };
        updateState();

        const disposable = model.onDidChangeContent(() => updateState());
        undoRedoDisposableRef.current = disposable;
        return disposable;
    };

    const setEditorInstance = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        setEditorInstanceState(editor);
        monacoRef.current = monaco;
    };

    const loadFileModel = useCallback((fileId: string, content: string) => {
        if (!editorInstance || !monacoRef.current) return;

        const monaco = monacoRef.current;
        const existingModel = modelsRef.current.get(fileId);
        const model = existingModel ?? monaco.editor.createModel(content, 'markdown');

        if (!existingModel) {
            modelsRef.current.set(fileId, model);
        }

        editorInstance.setModel(model);
        bindUndoRedoListener(model);

        orphanModelsRef.current.forEach((orphan) => orphan.dispose());
        orphanModelsRef.current = [];
    }, [editorInstance]);

    const disposeFileModel = (fileId: string) => {
        const model = modelsRef.current.get(fileId);
        if (!model) return;
        modelsRef.current.delete(fileId);

        // Disposing the model the editor is showing would break it until the next file loads
        if (editorInstance?.getModel() === model) {
            orphanModelsRef.current.push(model);
        } else {
            model.dispose();
        }
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

    const clearEditor = () => {
        if (editorInstance) {
            const model = editorInstance.getModel();
            if (model) {
                model.setValue('');
                editorInstance.focus();
            }
        }
        
        setCanUndo(false);
        setCanRedo(false);
    };

    useEffect(() => {
        if (!editorInstance) return;
        const model = editorInstance.getModel();
        if (!model) return;
        const disposable = bindUndoRedoListener(model);
        return () => disposable.dispose();
    }, [editorInstance]);

    return (
        <EditorContext.Provider value={{
            editorInstance, setEditorInstance, insertMarkdown, undo, redo, clearEditor,
            canUndo, canRedo, loadFileModel, disposeFileModel
        }}>
            {children}
        </EditorContext.Provider>
    );
}