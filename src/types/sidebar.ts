import React from 'react';
import type { IconType } from 'react-icons';

export type MenuView = 'main' | 'shortcuts' | 'theme';

export interface MenuItem {
    icon: IconType;
    label: string;
    description?: string;
    onClick?: () => void;
    view?: MenuView;
    hasSubview?: boolean;
    inlineComponent?: React.ReactNode;
}

export interface ShortcutItem {
    action: string;
    keys: string[];
}