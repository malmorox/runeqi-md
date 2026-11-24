import type { ShortcutKey, ViewModeKey } from '@/types/shortcut';

// Monaco binds KeyMod.CtrlCmd to Cmd on macOS, so the label has to follow
export const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);

// Keys to show for a shortcut, e.g. ['Ctrl', 'Shift', 'S']
export const shortcutKeys = (key: ShortcutKey): string[] => [
    isMac ? 'Cmd' : 'Ctrl',
    'Shift',
    key.replace(/^(Key|Digit)/, ''),
];

export const formatShortcut = (key: ShortcutKey) => shortcutKeys(key).join('+');

// View shortcuts use Ctrl+Alt so they don't collide with browser Ctrl+Shift shortcuts or the formatting ones
export const viewModeShortcutKeys = (key: ViewModeKey): string[] => [
    isMac ? 'Cmd' : 'Ctrl',
    isMac ? 'Option' : 'Alt',
    key.replace(/^(Key|Digit)/, ''),
];

export const formatViewModeShortcut = (key: ViewModeKey) => viewModeShortcutKeys(key).join('+');
