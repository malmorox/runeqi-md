import { useState } from "react";
import Toolbar from "@components/Toolbar";
import MarkdownWorkspace from "@components/MarkdownWorkspace";
import Sidebar from "@components/Sidebar";
import { useEditor } from "@hooks/useEditor"

const DesktopLayout = () => {
    const { insertMarkdown } = useEditor();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="w-screen h-screen flex overflow-hidden">
            <div className="flex-1 min-w-0 h-full flex flex-col">
                {/* Toolbar */}
                <div className="shrink-0">
                    <Toolbar 
                        onInsert={insertMarkdown} 
                        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} 
                        isSidebarOpen={sidebarOpen}
                    />
                </div>
                {/* Espacio de trabajo */}
                <div className="w-full h-full bg-[#1e1e1e] overflow-hidden"> 
                    <MarkdownWorkspace />
                </div>
            </div>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
    );
}

export default DesktopLayout;