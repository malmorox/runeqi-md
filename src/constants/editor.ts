import type { FontFamily } from '@/types/settings';

export const DEFAULT_FILE_CONTENT = '## Write your markdown here';

// Font stacks for the editor. The mono one is Monaco's own default for each OS (Menlo on macOS, Consolas on Windows,
// Droid Sans Mono on Linux): it has to be spelled out, since Monaco keeps the last font it was given
export const EDITOR_FONT_STACKS: Record<FontFamily, string> = {
    mono: 'Menlo, Monaco, Consolas, "Droid Sans Mono", "Courier New", monospace',
    sans: 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", serif',
};

export const EDITOR_FONT_FAMILY_OPTIONS: { value: FontFamily; label: string }[] = [
    { value: 'mono', label: 'Monospace' },
    { value: 'sans', label: 'Sans-serif' },
    { value: 'serif', label: 'Serif' },
];

export const EDITOR_FONT_SIZE_RANGE = { min: 10, max: 28 };

// Monaco reads values under 8 as a multiple of the font size
export const EDITOR_LINE_HEIGHT_OPTIONS = [1.2, 1.4, 1.6, 1.8, 2].map(height => ({ value: height, label: height.toFixed(1) }));

export const EDITOR_TAB_SIZE_OPTIONS = [2, 4, 8].map(size => ({ value: size, label: `${size} spaces` }));
