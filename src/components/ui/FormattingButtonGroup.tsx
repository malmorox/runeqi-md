import React from 'react';
import { LuUndo, LuRedo } from 'react-icons/lu';
import Dropdown from '@components/Dropdown';
import type { ToolbarButton } from '@/types/toolbar';
import ToolbarIconButton from './ToolbarIconButton';

interface FormattingButtonGroupProps {
    buttons: ToolbarButton[];
    openDropdown: string | null;
    onToggleDropdown: (name: string) => void;
    onCloseDropdown: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const FormattingButtonGroup = ({
    buttons, 
    openDropdown, 
    onToggleDropdown, 
    onCloseDropdown, 
    undo, 
    redo, 
    canUndo, 
    canRedo
}: FormattingButtonGroupProps) => (
    // Siempre en una sola fila: el layout deja sitio a la toolbar cerrando o superponiendo los paneles laterales
    <nav className="flex gap-0.5 items-center">
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

        <div className="w-px h-6 bg-[#4d4d4d] mx-1" />

        {buttons.map((button, index) => (
            <React.Fragment key={button.name}>
                <div className="relative">
                    <ToolbarIconButton
                        icon={button.icon}
                        iconSize={button.iconSize}
                        title={button.tooltip}
                        onClick={() => {
                            if (button.type === 'action') {
                                onCloseDropdown();
                                button.onClick();
                            } else {
                                onToggleDropdown(button.name);
                            }
                        }}
                    />
                    {button.type === 'dropdown' && (
                        <Dropdown isOpen={openDropdown === button.name}>
                            {button.dropdownContent}
                        </Dropdown>
                    )}
                </div>
                {(index === 6 || index === 9) && <div className="w-px h-6 bg-[#4d4d4d] mx-1" />}
            </React.Fragment>
        ))}
    </nav>
);

export default FormattingButtonGroup;