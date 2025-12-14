import { FaKeyboard, FaFileExport, FaPalette } from 'react-icons/fa';
import type { MenuItem, ShortcutItem } from '@/types/sidebar';
import ThemeSwitcher from '@components/ThemeSwitcher';

export const mainMenuItems: MenuItem[] = [
    {
        icon: FaKeyboard,
        label: 'Keyboard Shortcuts',
        description: 'View all available shortcuts.',
        view: 'shortcuts',
        hasSubview: true
    },
    {
        icon: FaFileExport,
        label: 'Export',
        description: 'Export current document.',
        onClick: () => {
            alert('Función de exportar - Próximamente');
        }
    },
    {
        icon: FaPalette,
        label: 'Theme',
        description: 'Switch between light and dark mode.',
        inlineComponent: <ThemeSwitcher />
    }
];

export const shortcuts: ShortcutItem[] = [
    { action: 'Heading', keys: ['Ctrl', 'H'] },
    { action: 'Bold', keys: ['Ctrl', 'B'] },
    { action: 'Italic', keys: ['Ctrl', 'I'] },
    { action: 'Strikethrough', keys: ['Ctrl', 'D'] },
    { action: 'Quote', keys: ['Ctrl', 'Q'] },
    { action: 'Code', keys: ['Ctrl', 'K'] },
    { action: 'Link', keys: ['Ctrl', 'L'] },
    { action: 'Unordered List', keys: ['Ctrl', 'U'] },
    { action: 'Ordered List', keys: ['Ctrl', 'O'] },
    { action: 'Task List', keys: ['Ctrl', 'T'] },
    { action: 'Code Block', keys: ['Ctrl', 'Shift', 'K'] },
    { action: 'Table', keys: ['Ctrl', 'Shift', 'T'] },
    { action: 'Image', keys: ['Ctrl', 'Shift', 'I'] },
    { action: 'Emoji', keys: ['Ctrl', 'E'] }
];

export const viewTitles: Record<string, string> = {
    'main': 'MENU',
    'shortcuts': 'KEYBOARD SHORTCUTS',
    'theme': 'THEME'
};