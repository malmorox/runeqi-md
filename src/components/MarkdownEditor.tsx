import { useMemo } from "react";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { useMarkdown } from "@hooks/useMarkdown";
import { useTheme } from "@hooks/useTheme";
import { useEditor } from "@hooks/useEditor";
import { useSettings } from "@hooks/useSettings";
import { useScrollSync } from "@hooks/useScrollSync";
import { useActiveFile } from "@hooks/useActiveFile";
import { useFileContent } from "@hooks/files/useFileContent";
import { useImageImport } from "@hooks/files/useImageImport";
import { imageMarkdown } from "@utils/imagePaths";
import type { editor } from 'monaco-editor';

// Se están arrastrando archivos desde fuera (no texto seleccionado dentro del editor)
const hasFiles = (data: DataTransfer | null) => !!data && Array.from(data.types).includes("Files");

const MarkdownEditor = () => {
    const { markdown } = useMarkdown();
    const { theme } = useTheme();
    const { editorInstance, setEditorInstance, loadFileModel, insertMarkdown } = useEditor();
    const { settings } = useSettings();
    const { registerEditor } = useScrollSync();
    const { activeFileId } = useActiveFile();
    const { handleChange } = useFileContent(activeFileId, (content) => loadFileModel(activeFileId!, content));
    // The inserted image is the feedback: only rejected images get an alert
    const { importImages } = useImageImport();

    // Guarda las imágenes en la carpeta Images e inserta su Markdown en el cursor
    const insertImages = async (files: File[], pasted: boolean) => {
        const saved = await importImages(files, { pasted });
        if (saved.length) insertMarkdown(saved.map((entry) => imageMarkdown(entry.name)).join("\n"));
    };

    // Los eventos se capturan antes de que lleguen a Monaco, que pegaría o soltaría la imagen como texto
    const handlePaste = (e: React.ClipboardEvent) => {
        const { files, types } = e.clipboardData;
        // Si también hay texto (p. ej. al copiar de Word, que añade una imagen del fragmento) se pega el texto
        if (files.length === 0 || types.includes("text/plain")) return;
        e.preventDefault();
        e.stopPropagation();
        insertImages(Array.from(files), true);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!hasFiles(e.dataTransfer)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!hasFiles(e.dataTransfer)) return;
        e.preventDefault();
        e.stopPropagation();
        // Las imágenes se insertan donde se sueltan, no donde estaba el cursor
        const position = editorInstance?.getTargetAtClientPoint(e.clientX, e.clientY)?.position;
        if (position) editorInstance?.setPosition(position);
        insertImages(Array.from(e.dataTransfer.files), false);
    };

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

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        setEditorInstance(editor, monaco);
        registerEditor(editor);

        editor.addCommand(monaco.KeyCode.Enter, () => {
            const model = editor.getModel();
            const position = editor.getPosition();
            if (!model || !position) return;

            const lineContent = model.getLineContent(position.lineNumber);

            const emptyList = lineContent.match(/^(\s*)(-\s+(\[[ x]\]\s*)?|\d+\.\s*)$/);
            if (emptyList) {
                const range = {
                    startLineNumber: position.lineNumber,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: lineContent.length + 1,
                };
                editor.executeEdits('', [{ range, text: '' }]);
                return;
            }
            
            // Task list: - [ ] o - [x]
            const taskMatch = lineContent.match(/^(\s*)-\s+\[[ x]\]\s*(.*)$/);
            // Unordered list: - item
            const unorderedMatch = lineContent.match(/^(\s*)-\s+(.+)$/);
            // Ordered list: 1. item
            const orderedMatch = lineContent.match(/^(\s*)(\d+)\.\s+(.+)$/);

            let insertion = '\n';

            if (taskMatch) {
                insertion = '\n' + taskMatch[1] + '- [ ] ';
            } else if (unorderedMatch) {
                insertion = '\n' + unorderedMatch[1] + '- ';
            } else if (orderedMatch) {
                const nextNum = parseInt(orderedMatch[2]) + 1;
                insertion = '\n' + orderedMatch[1] + `${nextNum}. `;
            }

            editor.trigger('keyboard', 'type', { text: insertion });
        });
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
        <div
            className="w-full h-full"
            onPasteCapture={handlePaste}
            onDragOverCapture={handleDragOver}
            onDropCapture={handleDrop}
        >
            <Editor
                height="100%"
                defaultLanguage="markdown"
                theme={theme === 'vs-dark' ? 'customDark' : theme}
                defaultValue={markdown}
                onChange={(v) => handleChange(v ?? '')}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                options={editorOptions}
            />
        </div>
    );
}

export default MarkdownEditor
