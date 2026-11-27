import React from 'react';
import { LuUndo, LuRedo } from 'react-icons/lu';
import Dropdown from '@components/Dropdown';
import type { ToolbarButton } from '@/types/toolbar';
import type { ShortcutId } from '@/types/shortcut';
import ToolbarIconButton from './ToolbarIconButton';

interface FormattingButtonGroupProps {
    buttons: ToolbarButton[];
    openDropdown: ShortcutId | null;
    onButtonClick: (button: ToolbarButton) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const FormattingButtonGroup = ({
    buttons, 
    openDropdown,
    onButtonClick,
    undo,
    redo, 
    canUndo, 
    canRedo
}: FormattingButtonGroupProps) => (
    // Siempre en una sola fila: el layout deja sitio a la toolbar cerrando o superponiendo los paneles laterales
    <nav className="formatting-buttons">
        <ToolbarIconButton 
            icon={LuUndo} 
            iconSize={24} 
            onClick={undo} 
            disabled={!canUndo} 
            title="Undo" 
        />
        <ToolbarIconButton 
            icon={LuRedo} 
            iconSize={24} 
            onClick={redo} 
            disabled={!canRedo} 
            title="Redo" 
        />

        <div className="toolbar-separator" />

        {buttons.map((button, index) => (
            <React.Fragment key={button.name}>
                <div className="toolbar-button-slot">
                    <ToolbarIconButton
                        icon={button.icon}
                        iconSize={button.iconSize}
                        title={button.tooltip}
                        onClick={() => onButtonClick(button)}
                    />
                    {button.type === 'dropdown' && (
                        <Dropdown isOpen={openDropdown === button.name}>
                            {button.dropdownContent}
                        </Dropdown>
                    )}
                </div>
                {(index === 6 || index === 9) && <div className="toolbar-separator" />}
            </React.Fragment>
        ))}
    </nav>
);

export default FormattingButtonGroup;