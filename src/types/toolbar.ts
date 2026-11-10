import type { IconType } from 'react-icons';
import type { ShortcutId } from '@/types/shortcut';

export type ActionButton = {
    type: 'action';
    icon: IconType;
    iconSize: number;
    tooltip: string;
    name: ShortcutId;
    onClick: () => void;
};

export type DropdownButton = {
    type: 'dropdown';
    icon: IconType;
    iconSize: number;
    tooltip: string;
    name: ShortcutId;
    dropdownContent: React.ReactNode;
};

export type ToolbarButton = ActionButton | DropdownButton;