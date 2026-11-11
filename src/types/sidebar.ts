import React from 'react';
import type { IconType } from 'react-icons';

export type MenuView = 'main' | 'shortcuts' | 'theme' | 'settings' | 'import-export' | 'about';

export interface MenuItem {
    icon: IconType;
    label: string;
    description?: string;
    onClick?: () => void;
    view?: MenuView;
    hasSubview?: boolean;
    inlineComponent?: React.ReactNode;
    disabled?: boolean;
}
