import { useState, useRef, useEffect } from 'react';
import { FaFolder } from 'react-icons/fa6';
import { SlOptions } from "react-icons/sl";
import ToolbarToggleButton from '@components/ui/ToolbarToggleButton';
import FormattingButtonGroup from '@components/ui/FormattingButtonGroup';
import ActiveFileName from '@components/ui/ActiveFileName';
import { useToolbarButtons } from '@hooks/toolbar/useToolbarButtons';
import { useEditor } from "@hooks/useEditor";
import { useSettings } from "@hooks/useSettings";


interface MarkdownToolbarProps {
    onInsert: (markdown: string, cursorOffset?: number) => void;
    onSidebarToggle: () => void;
    isSidebarOpen: boolean;
    onExplorerToggle: () => void;
    isExplorerOpen: boolean;
}

const Toolbar = ({ onInsert, onSidebarToggle, isSidebarOpen, onExplorerToggle, isExplorerOpen }: MarkdownToolbarProps) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { undo, redo, canUndo, canRedo } = useEditor();
    const { settings } = useSettings();

    const isEditorVisible = settings.workspace.viewMode === 'editor' || settings.workspace.viewMode === 'split';
    const toggleDropdown = (name: string) => setOpenDropdown((prev) => (prev === name ? null : name));
    const closeDropdown = () => setOpenDropdown(null);

    const toolbarButtons = useToolbarButtons({ onInsert, closeDropdown });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        // Columnas: explorador | botones de formato | nombre del archivo | opciones.
        // Los botones ocupan siempre todo su ancho en una sola fila y el nombre se queda con el espacio que sobre:
        // se acorta con "..." e incluso desaparece antes de que nada se salga de la pantalla.
        <div className="bg-[#1e1e1e] px-1 py-1 grid grid-cols-[auto_max-content_minmax(0,1fr)_auto] gap-2 items-center" ref={dropdownRef}>
            <ToolbarToggleButton
                icon={FaFolder}
                isActive={isExplorerOpen}
                onClick={onExplorerToggle}
                title="Toggle explorer"
            />
            
            {isEditorVisible && (
                <FormattingButtonGroup
                    buttons={toolbarButtons}
                    openDropdown={openDropdown}
                    onToggleDropdown={toggleDropdown}
                    onCloseDropdown={closeDropdown}
                    undo={undo}
                    redo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />
            )}

            {/* Columna fija: aunque no haya botones de formato (solo preview), el nombre sigue a la derecha */}
            <div className="col-start-3 flex justify-end mr-1 min-w-0">
                <ActiveFileName />
            </div>
            <ToolbarToggleButton
                icon={SlOptions}
                isActive={isSidebarOpen}
                onClick={onSidebarToggle}
                title="Toggle sidebar"
            />
        </div>
    );
};

export default Toolbar;