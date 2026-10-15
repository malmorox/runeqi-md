import { useState } from "react";
import Toolbar from "@components/Toolbar";
import MarkdownWorkspace from "@components/MarkdownWorkspace";
import Sidebar from "@components/Sidebar";
import FileExplorer from "@components/FileExplorer";
import { useEditor } from "@hooks/useEditor"
import { useEnsureFileSystem } from "@hooks/files/useEnsureFileSystem";

const DesktopLayout = () => {
    useEnsureFileSystem();
    const { insertMarkdown } = useEditor();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isFileExplorerOpen, setFileExplorerOpen] = useState(false);

    return (
        <div className="w-screen h-screen flex overflow-hidden">
            <FileExplorer
                isOpen={isFileExplorerOpen}
                onClose={() => setFileExplorerOpen(false)}
            />
            <div className="flex-1 min-w-0 h-full flex flex-col">
                {/* Toolbar */}
                <div className="shrink-0">
                    <Toolbar 
                        onInsert={insertMarkdown} 
                        onSidebarToggle={() => setSidebarOpen(!isSidebarOpen)} 
                        isSidebarOpen={isSidebarOpen}
                        onExplorerToggle={() => setFileExplorerOpen(!isFileExplorerOpen)}
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
                onClose={() => setSidebarOpen(false)} 
            />
        </div>
    );
}

export default DesktopLayout;