import { useState, useRef, useEffect } from 'react';
import { FaFolder } from 'react-icons/fa6';
import { SlOptions } from "react-icons/sl";
import ToolbarToggleButton from '@components/ui/ToolbarToggleButton';
import FormattingButtonGroup from '@components/ui/FormattingButtonGroup';
import ActiveFileName from '@components/ui/ActiveFileName';
import { useToolbarButtons } from '@hooks/toolbar/useToolbarButtons';
import { useEditor } from "@hooks/useEditor";
import { useSettings } from "@hooks/useSettings";
import { useEditorShortcuts } from '@hooks/editor/useEditorShortcuts';
import type { ToolbarButton } from '@/types/toolbar';
import type { ShortcutId } from '@/types/shortcut';


interface MarkdownToolbarProps {
    onSidebarToggle: () => void;
    isSidebarOpen: boolean;
    onExplorerToggle: () => void;
    isExplorerOpen: boolean;
}

const Toolbar = ({ onSidebarToggle, isSidebarOpen, onExplorerToggle, isExplorerOpen }: MarkdownToolbarProps) => {
    const [openDropdown, setOpenDropdown] = useState<ShortcutId | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { editorInstance, undo, redo, canUndo, canRedo } = useEditor();
    const { settings } = useSettings();

    const isEditorVisible = settings.workspace.viewMode === 'editor' || settings.workspace.viewMode === 'split';
    const closeDropdown = () => setOpenDropdown(null);

    const toolbarButtons = useToolbarButtons({ closeDropdown });

    // Shared by the button click and its keyboard shortcut, so both always do the same
    const handleButton = (button: ToolbarButton) => {
        if (button.type === 'action') {
            closeDropdown();
            button.onClick();
        } else {
            setOpenDropdown((prev) => (prev === button.name ? null : button.name));
        }
    };

    useEditorShortcuts((id) => {
        const button = toolbarButtons.find((b) => b.name === id);
        if (button) handleButton(button);
    });

    // Escape closes the open dropdown and gives the focus back to the editor.
    // Captured before Monaco, which would otherwise use it to clear the selection and keep the dropdown open
    useEffect(() => {
        if (!openDropdown) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            setOpenDropdown(null);
            editorInstance?.focus();
        };

        document.addEventListener('keydown', handleEscape, true);
        return () => document.removeEventListener('keydown', handleEscape, true);
    }, [openDropdown, editorInstance]);

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
                    onButtonClick={handleButton}
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