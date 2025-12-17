import { useState } from "react";
import Toolbar from "@components/Toolbar";
import MarkdownWorkspace from "@components/MarkdownWorkspace";
import Sidebar from "@components/Sidebar";
import { useEditor } from "@hooks/useEditor"
import "./App.css"

export default function App() {
    const { insertMarkdown } = useEditor();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="w-screen h-screen flex overflow-hidden">
            <div className="flex-1 min-w-0 h-full flex flex-col">
                <div className="shrink-0">
                    {/* Toolbar */}
                    <Toolbar 
                        onInsert={insertMarkdown} 
                        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} 
                        isSidebarOpen={sidebarOpen}
                    />
                </div>
                {/* Paneles */}
                <div className="w-full h-full bg-[#1e1e1e] overflow-hidden"> 
                    {/* Espacio de trabajo */}
                    <MarkdownWorkspace />
                </div>
            </div>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
    );
}
