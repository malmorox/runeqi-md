import type { ShortcutItem } from '@/types/sidebar';

export const shortcuts: ShortcutItem[] = [
    { action: 'Heading', keys: ['Ctrl', 'H'] },
    { action: 'Bold', keys: ['Ctrl', 'B'] },
    { action: 'Italic', keys: ['Ctrl', 'I'] },
    { action: 'Strikethrough', keys: ['Ctrl', 'D'] },
    { action: 'Quote', keys: ['Ctrl', 'Q'] },
    { action: 'Code', keys: ['Ctrl', 'K'] },
    { action: 'Link', keys: ['Ctrl', 'L'] },
    { action: 'Unordered list', keys: ['Ctrl', 'U'] },
    { action: 'Ordered list', keys: ['Ctrl', 'O'] },
    { action: 'Task list', keys: ['Ctrl', 'T'] },
    { action: 'Code block', keys: ['Ctrl', 'Shift', 'K'] },
    { action: 'Table', keys: ['Ctrl', 'Shift', 'T'] },
    { action: 'Image', keys: ['Ctrl', 'Shift', 'I'] },
    { action: 'Emoji', keys: ['Ctrl', 'E'] }
];

export const viewTitles: Record<string, string> = {
    'main': 'MENU',
    'shortcuts': 'KEYBOARD SHORTCUTS',
    'theme': 'THEME',
    'settings': 'SETTINGS'
};