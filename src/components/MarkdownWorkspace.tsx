import MarkdownEditor from "@components/MarkdownEditor";
import MarkdownPreview from "@components/MarkdownPreview";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useTheme } from "@hooks/useTheme";
import { useViewMode } from "@hooks/useViewMode";
import { ScrollSyncProvider } from "@contexts/ScrollSyncContext";

// Espacio de trabajo dividido en 2 paneles, el editor de Markdown y el intérprete que muestra su salida. Los paneles son redimensionables (de la libreria 'react-resizable-panels'), para dar libertad al usuario a la hora de trabajar.
const MarkdownWorkspace = () => {
    const { theme } = useTheme();
    const { viewMode } = useViewMode();

    const isSplit = viewMode === "split";
    const showEditor = viewMode !== "preview";
    const showPreview = viewMode !== "editor";

    return (
        <ScrollSyncProvider>
            <PanelGroup direction="horizontal" className="workspace-panels">
                <Panel
                    defaultSize={50}
                    minSize={20}
                    style={{ display: showEditor ? undefined : "none" }}
                >
                    <MarkdownEditor />
                </Panel>
                <PanelResizeHandle
                    disabled={!isSplit}
                    style={{ display: isSplit ? undefined : "none" }}
                    className={`workspace-resize-handle ${theme === "dark" ? "dark" : ""}`}
                />
                <Panel
                    defaultSize={50}
                    minSize={20}
                    style={{ display: showPreview ? undefined : "none" }}
                >
                    <MarkdownPreview />
                </Panel>
            </PanelGroup>
        </ScrollSyncProvider>
    );
};

export default MarkdownWorkspace;