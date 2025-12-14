import MarkdownEditor from "@components/MarkdownEditor";
import MarkdownInterpreter from "@components/MarkdownInterpreter";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useTheme } from "@hooks/useTheme";

// Espacio de trabajo dividido en 2 paneles, el editor de Markdown y el intérprete que muestra su salida. Los paneles son redimensionables (de la libreria 'react-resizable-panels'), para dar libertad al usuario a la hora de trabajar.
const MarkdownWorkspace = () => {
    const { theme } = useTheme();

    return (
        <PanelGroup direction="horizontal" className="w-full h-full">
            {/* EDITOR */}
            <Panel defaultSize={50} minSize={20}>
                <MarkdownEditor />
            </Panel>

            {/* Barra de redimensión */}
            <PanelResizeHandle className={`w-2 cursor-col-resize ${
                    theme === "vs-dark"
                        ? "bg-[#252526] hover:bg-[#212122]"
                        : "bg-[#d4d4d4] hover:bg-[#c8c8c8]"}`}
            />

            {/* INTÉRPRETE */}
            <Panel defaultSize={50} minSize={20}>
                <div className="w-full h-full">
                    <MarkdownInterpreter />
                </div>
            </Panel>
        </PanelGroup>
    );
};

export default MarkdownWorkspace;