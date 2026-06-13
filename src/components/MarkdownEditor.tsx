import { useMemo } from "react";
import Editor, { type BeforeMount } from "@monaco-editor/react";
import { useMarkdown } from "@hooks/useMarkdown";
import { useTheme } from "@hooks/useTheme";
import { useEditor } from "@hooks/useEditor";
import { useSettings } from "@hooks/useSettings";
import type { editor } from 'monaco-editor';

// Editor de Markdown con Monaco que sincroniza el contenido y aplica el tema seleccionado.
const MarkdownEditor = () => {
    const { markdown, setMarkdown } = useMarkdown();
    const { theme } = useTheme();
    const { setEditorInstance } = useEditor();
    const { settings } = useSettings();

    const handleEditorWillMount: BeforeMount = (monaco) => {
        // tema oscuro personalizado con fondo más claro
        monaco.editor.defineTheme('customDark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#2d2d30', // Fondo gris oscuro más claro
                'editor.lineHighlightBackground': '#3e3e42', // Línea actual
                'editorLineNumber.foreground': '#858585', // Números de línea
            }
        });
    };

    const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
        setEditorInstance(editor);
    };

    const editorOptions = useMemo((): editor.IStandaloneEditorConstructionOptions => ({
        lineNumbers: settings.editor.lineNumbers ? "on" : "off",
        wordWrap: settings.editor.wordWrap ? "on" : "off",
        minimap: { enabled: settings.editor.minimap },
        fontSize: 14,
        scrollBeyondLastLine: false,
        padding: { top: 24, bottom: 24 },
        automaticLayout: true
    }), [settings.editor]);

    return (
        <div className="w-full h-full">
            <Editor
                height="100%"
                defaultLanguage="markdown"
                theme={theme === 'vs-dark' ? 'customDark' : theme}
                defaultValue={markdown}
                onChange={(v) => setMarkdown(v ?? "")}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                options={editorOptions}
            />
        </div>
    );
}

export default MarkdownEditor
