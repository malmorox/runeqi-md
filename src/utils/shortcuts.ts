import type { ShortcutKey } from '@/types/shortcut';

// Monaco binds KeyMod.CtrlCmd to Cmd on macOS, so the label has to follow
const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);

// Keys to show for a shortcut, e.g. ['Ctrl', 'Shift', 'S']
export const shortcutKeys = (key: ShortcutKey): string[] => [
    isMac ? 'Cmd' : 'Ctrl',
    'Shift',
    key.replace(/^(Key|Digit)/, ''),
];

export const formatShortcut = (key: ShortcutKey) => shortcutKeys(key).join('+');
