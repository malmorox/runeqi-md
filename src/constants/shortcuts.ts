import type { ShortcutId, ShortcutDefinition } from '@/types/shortcut';

// One shortcut per toolbar button, always pressed with Ctrl+Shift (Cmd+Shift on macOS) plus its key.
// useEditorShortcuts registers them in Monaco and they do what clicking the button does.
// While the editor has focus some of them replace a Monaco or browser shortcut: K (delete line), L (select all occurrences)
// and C / I (DevTools inspect / open)
export const SHORTCUTS: Record<ShortcutId, ShortcutDefinition> = {
    heading: {
        id: 'heading',
        label: 'Heading',
        key: 'KeyH',
    },
    bold: {
        id: 'bold',
        label: 'Bold',
        key: 'KeyB',
    },
    italic: {
        id: 'italic',
        label: 'Italic',
        key: 'KeyI',
    },
    strikethrough: {
        id: 'strikethrough',
        label: 'Strikethrough',
        key: 'KeyS',
    },
    quote: {
        id: 'quote',
        label: 'Blockquote',
        key: 'KeyQ',
    },
    code: {
        id: 'code',
        label: 'Code',
        key: 'KeyK',
    },
    link: {
        id: 'link',
        label: 'Link',
        key: 'KeyL',
    },
    'unordered-list': {
        id: 'unordered-list',
        label: 'Unordered list',
        key: 'KeyU',
    },
    'ordered-list': {
        id: 'ordered-list',
        label: 'Ordered list',
        key: 'KeyO',
    },
    'task-list': {
        id: 'task-list',
        label: 'Task list',
        key: 'KeyX',
    },
    codeblock: {
        id: 'codeblock',
        label: 'Code block',
        key: 'KeyC',
    },
    table: {
        id: 'table',
        label: 'Table',
        key: 'KeyM',
    },
    image: {
        id: 'image',
        label: 'Image',
        key: 'KeyG',
    },
    emoji: {
        id: 'emoji',
        label: 'Emoji',
        key: 'KeyE',
    },
};
