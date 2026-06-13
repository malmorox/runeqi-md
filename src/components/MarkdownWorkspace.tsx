import MarkdownEditor from "@components/MarkdownEditor";
import MarkdownInterpreter from "@components/MarkdownInterpreter";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useTheme } from "@hooks/useTheme";
import { useSettings } from "@hooks/useSettings";

// Espacio de trabajo dividido en 2 paneles, el editor de Markdown y el intérprete que muestra su salida. Los paneles son redimensionables (de la libreria 'react-resizable-panels'), para dar libertad al usuario a la hora de trabajar.
const MarkdownWorkspace = () => {
    const { theme } = useTheme();
    const { settings } = useSettings();
    const { viewMode, swapPanels } = settings.workspace;

    const editorNode = <MarkdownEditor />;
    const previewNode = <MarkdownInterpreter />;

    if (viewMode === "editor") {
        return <div className="w-full h-full">{editorNode}</div>;
    }

    if (viewMode === "preview") {
        return <div className="w-full h-full">{previewNode}</div>;
    }

    return (
        <PanelGroup direction="horizontal" className="w-full h-full">
            {swapPanels ? (
                <>
                    <Panel defaultSize={50} minSize={20}>{previewNode}</Panel>
                    <PanelResizeHandle className={`w-2 cursor-col-resize ${
                        theme === "vs-dark" ? "bg-[#252526] hover:bg-[#212122]" : "bg-[#d4d4d4] hover:bg-[#c8c8c8]"
                    }`} />
                    <Panel defaultSize={50} minSize={20}>{editorNode}</Panel>
                </>
            ) : (
                <>
                    <Panel defaultSize={50} minSize={20}>{editorNode}</Panel>
                    <PanelResizeHandle className={`w-2 cursor-col-resize ${
                        theme === "vs-dark" ? "bg-[#252526] hover:bg-[#212122]" : "bg-[#d4d4d4] hover:bg-[#c8c8c8]"
                    }`} />
                    <Panel defaultSize={50} minSize={20}>{previewNode}</Panel>
                </>
            )}
        </PanelGroup>
    );
};

export default MarkdownWorkspace;