import { useEffect, useState } from "react";
import Toolbar from "@components/Toolbar";
import MarkdownWorkspace from "@components/MarkdownWorkspace";
import Sidebar from "@components/Sidebar";
import FileExplorer from "@components/FileExplorer";
import Alerts from "@components/Alerts";
import { useEditor } from "@hooks/useEditor"
import { useEnsureFileSystem } from "@hooks/files/useEnsureFileSystem";

type SidePanel = 'explorer' | 'menu';

// The toolbar needs 815px on one row and each side panel 320px: below this width they don't all fit,
// so opening one panel closes the other. Below the `panel-overlay` width (index.css) not even one fits
// next to the toolbar, and the open panel goes over the workspace instead
const SINGLE_PANEL_QUERY = '(width < 1480px)';

const DesktopLayout = () => {
    useEnsureFileSystem();
    const { insertMarkdown } = useEditor();
    // Open side panels, the most recently opened last
    const [openPanels, setOpenPanels] = useState<SidePanel[]>([]);

    const isSidebarOpen = openPanels.includes('menu');
    const isFileExplorerOpen = openPanels.includes('explorer');

    const togglePanel = (panel: SidePanel) => {
        const singlePanel = window.matchMedia(SINGLE_PANEL_QUERY).matches;
        setOpenPanels((open) => {
            if (open.includes(panel)) return open.filter((p) => p !== panel);
            return singlePanel ? [panel] : [...open, panel];
        });
    };

    const closePanel = (panel: SidePanel) => setOpenPanels((open) => open.filter((p) => p !== panel));

    // If the window gets narrower with both panels open, only the last one opened stays
    useEffect(() => {
        const query = window.matchMedia(SINGLE_PANEL_QUERY);
        const keepLatest = () => {
            if (query.matches) setOpenPanels((open) => open.slice(-1));
        };
        query.addEventListener('change', keepLatest);
        return () => query.removeEventListener('change', keepLatest);
    }, []);

    return (
        <div className="w-screen h-screen flex overflow-hidden">
            <FileExplorer
                isOpen={isFileExplorerOpen}
                onClose={() => closePanel('explorer')}
            />
            <div className="flex-1 min-w-0 h-full flex flex-col">
                {/* Toolbar */}
                <div className="shrink-0">
                    <Toolbar
                        onInsert={insertMarkdown}
                        onSidebarToggle={() => togglePanel('menu')}
                        isSidebarOpen={isSidebarOpen}
                        onExplorerToggle={() => togglePanel('explorer')}
                        isExplorerOpen={isFileExplorerOpen}
                    />
                </div>
                {/* Espacio de trabajo */}
                <div className="w-full h-full bg-[#1e1e1e] overflow-hidden">
                    <MarkdownWorkspace />
                </div>
            </div>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => closePanel('menu')}
            />
            <Alerts />
        </div>
    );
}

export default DesktopLayout;
