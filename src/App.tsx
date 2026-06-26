import { useState } from "react";
import Toolbar from "@components/Toolbar";
import MarkdownWorkspace from "@components/MarkdownWorkspace";
import Sidebar from "@components/Sidebar";
import { useEditor } from "@hooks/useEditor"
import "./App.css"

export default function App() {
    const { insertMarkdown } = useEditor();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#1e1e1e] text-white text-center p-8">
                <h1 className="text-2xl font-bold mb-4">Desktop only</h1>
                <p className="text-gray-400">RuneQi is designed for desktop. Please open it on a larger screen.</p>
            </div>
        );
    }

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
