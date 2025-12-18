import React from 'react';
import type { IconType } from 'react-icons';

export type MenuView = 'main' | 'shortcuts' | 'theme' | 'settings';

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

export type ShortcutId =
    | 'heading'
    | 'bold'
    | 'italic'
    | 'strikethrough'
    | 'quote'
    | 'code'
    | 'link'
    | 'unordered-list'
    | 'ordered-list'
    | 'task-list'
    | 'codeblock'
    | 'table'
    | 'image'
    | 'emoji';

export interface ShortcutDefinition {
    id: ShortcutId;
    label: string;
    keys: string[];
}