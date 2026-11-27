import { useEffect, useState } from "react";
import Toolbar from "@components/Toolbar";
import MarkdownWorkspace from "@components/MarkdownWorkspace";
import Sidebar from "@components/sidebar/Sidebar";
import FileExplorer from "@components/fileExplorer/FileExplorer";
import Alerts from "@components/Alerts";
import { useEnsureFileSystem } from "@hooks/files/useEnsureFileSystem";

type SidePanel = 'explorer' | 'menu';

// The toolbar needs 815px on one row and each side panel 320px: below this width they don't all fit,
// so opening one panel closes the other. Below the `panel-overlay` width (index.css) not even one fits
// next to the toolbar, and the open panel goes over the workspace instead
const SINGLE_PANEL_QUERY = '(width < 1480px)';

const DesktopLayout = () => {
    useEnsureFileSystem();
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
        <div className="app-shell">
            <FileExplorer
                isOpen={isFileExplorerOpen}
                onClose={() => closePanel('explorer')}
            />
            <div className="app-main">
                {/* Toolbar */}
                <div className="app-toolbar-slot">
                    <Toolbar
                        onSidebarToggle={() => togglePanel('menu')}
                        isSidebarOpen={isSidebarOpen}
                        onExplorerToggle={() => togglePanel('explorer')}
                        isExplorerOpen={isFileExplorerOpen}
                    />
                </div>
                {/* Espacio de trabajo */}
                <div className="app-workspace">
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
