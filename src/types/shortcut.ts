import type { KeyCode } from 'monaco-editor';

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

// Monaco key code name of the physical key, e.g. 'KeyB'
export type ShortcutKey = keyof typeof KeyCode;

export interface ShortcutDefinition {
    id: ShortcutId;
    label: string;
    // Always pressed with Ctrl+Shift (Cmd+Shift on macOS)
    key: ShortcutKey;
}
