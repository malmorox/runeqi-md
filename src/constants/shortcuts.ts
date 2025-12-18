import type { ShortcutId, ShortcutDefinition } from '@/types/sidebar';

export const SHORTCUTS: Record<ShortcutId, ShortcutDefinition> = {
    heading: {
        id: 'heading',
        label: 'Heading',
        keys: ['Ctrl', 'Shift', 'H'],
    },
    bold: {
        id: 'bold',
        label: 'Bold',
        keys: ['Ctrl', 'Shift', 'B'],
    },
    italic: {
        id: 'italic',
        label: 'Italic',
        keys: ['Ctrl', 'Shift', 'I'],
    },
    strikethrough: {
        id: 'strikethrough',
        label: 'Strikethrough',
        keys: ['Ctrl', 'Shift', 'S'],
    },
    quote: {
        id: 'quote',
        label: 'Blockquote',
        keys: ['Ctrl', 'Shift', 'Q'],
    },
    code: {
        id: 'code',
        label: 'Code',
        keys: ['Ctrl', 'Shift', 'C'],
    },
    link: {
        id: 'link',
        label: 'Link',
        keys: ['Ctrl', 'Shift', 'L'],
    },
    'unordered-list': {
        id: 'unordered-list',
        label: 'Unordered list',
        keys: ['Ctrl', 'Shift', 'U'],
    },
    'ordered-list': {
        id: 'ordered-list',
        label: 'Ordered list',
        keys: ['Ctrl', 'Shift', 'O'],
    },
    'task-list': {
        id: 'task-list',
        label: 'Task list',
        keys: ['Ctrl', 'Shift', 'T'],
    },
    codeblock: {
        id: 'codeblock',
        label: 'Code block',
        keys: ['Ctrl', 'Shift', 'K'],
    },
    table: {
        id: 'table',
        label: 'Table',
        keys: ['Ctrl', 'Shift', 'M'],
    },
    image: {
        id: 'image',
        label: 'Image',
        keys: ['Ctrl', 'Shift', 'I'],
    },
    emoji: {
        id: 'emoji',
        label: 'Emoji',
        keys: ['Ctrl', 'Shift', 'E'],
    },
};