import { useEffect, useEffectEvent } from 'react';
import { useEditor } from '@hooks/useEditor';
import { SHORTCUTS } from '@constants/shortcuts';
import type { ShortcutId } from '@/types/shortcut';

// Registers every shortcut as a Monaco action: they only fire while the editor has focus,
// take precedence over Monaco's own keybindings and also show up in its command palette (F1)
export const useEditorShortcuts = (onShortcut: (id: ShortcutId) => void) => {
    const { editorInstance, monaco } = useEditor();

    // Monaco keeps the callback it was given at registration, so it has to read the latest onShortcut
    const runShortcut = useEffectEvent((id: ShortcutId) => onShortcut(id));

    useEffect(() => {
        if (!editorInstance || !monaco) return;
        const { KeyMod, KeyCode } = monaco;

        const registered = Object.values(SHORTCUTS).map(({ id, label, key }) => (
            editorInstance.addAction({
                id: `markdown.${id}`,
                label: `Markdown: ${label}`,
                keybindings: [KeyMod.CtrlCmd | KeyMod.Shift | KeyCode[key]],
                run: () => runShortcut(id),
            })
        ));

        return () => registered.forEach((action) => action.dispose());
    }, [editorInstance, monaco]);
};
