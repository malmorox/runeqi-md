import type { ShortcutItem } from '@/types/sidebar';

export const shortcuts: ShortcutItem[] = [
    { action: 'Heading', keys: ['Ctrl', 'Shift', 'H'] },
    { action: 'Bold', keys: ['Ctrl', 'Shift', 'B'] },
    { action: 'Italic', keys: ['Ctrl', 'Shift', 'I'] },
    { action: 'Strikethrough', keys: ['Ctrl', 'Shift', 'S'] },
    { action: 'Quote', keys: ['Ctrl', 'Shift', 'Q'] },
    { action: 'Code', keys: ['Ctrl', 'Shift', 'C'] },
    { action: 'Link', keys: ['Ctrl', 'Shift', 'L'] },
    { action: 'Unordered list', keys: ['Ctrl', 'Shift', 'U'] },
    { action: 'Ordered list', keys: ['Ctrl', 'Shift', 'O'] },
    { action: 'Task list', keys: ['Ctrl', 'Shift', 'T'] },
    { action: 'Code block', keys: ['Ctrl', 'Shift', 'K'] },
    { action: 'Table', keys: ['Ctrl', 'Shift', 'T'] },
    { action: 'Image', keys: ['Ctrl', 'Shift', 'I'] },
    { action: 'Emoji', keys: ['Ctrl', 'Shift', 'E'] }
];

export const viewTitles: Record<string, string> = {
    'main': 'MENU',
    'shortcuts': 'KEYBOARD SHORTCUTS',
    'theme': 'THEME',
    'settings': 'SETTINGS'
};