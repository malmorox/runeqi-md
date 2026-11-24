import { useEffect, useEffectEvent } from 'react';
import { useViewMode } from '@hooks/useViewMode';
import { VIEW_MODES } from '@constants/viewModes';
import { isMac } from '@utils/shortcuts';

// A document listener rather than a Monaco action: the editor is hidden in preview mode and can't take focus.
// Captured so it runs before Monaco. event.code is used because Option+digit changes event.key on macOS
export const useViewModeShortcuts = (): void => {
    const { setViewMode } = useViewMode();

    const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
        if (event.repeat || event.shiftKey || !event.altKey || !(event.ctrlKey || event.metaKey)) return;
        const mode = VIEW_MODES.find(({ key }) => key === event.code);
        if (!mode) return;
        // Windows reports AltGr as Ctrl+Alt, so AltGr+digit ("@", "#"...) is typing, not a view switch.
        // Not on macOS: Cmd+Option is never AltGr there, and Option changes event.key anyway
        if (!isMac && (event.getModifierState('AltGraph') || event.key !== mode.key.replace('Digit', ''))) return;
        event.preventDefault();
        setViewMode(mode.id);
    });

    useEffect(() => {
        const listener = (event: KeyboardEvent) => handleKeyDown(event);
        document.addEventListener('keydown', listener, true);
        return () => document.removeEventListener('keydown', listener, true);
    }, []);
};
