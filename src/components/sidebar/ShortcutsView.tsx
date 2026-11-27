import React from 'react';
import { SHORTCUTS } from '@constants/shortcuts';
import { VIEW_MODES } from '@constants/viewModes';
import { shortcutKeys, viewModeShortcutKeys } from '@utils/shortcuts';

interface ShortcutGroup {
    id: string;
    title: string;
    shortcuts: { id: string; label: string; keys: string[] }[];
}

const groups: ShortcutGroup[] = [
    {
        id: 'formatting',
        title: 'Formatting',
        shortcuts: Object.values(SHORTCUTS).map(({ id, label, key }) => ({ id, label, keys: shortcutKeys(key) })),
    },
    {
        id: 'view',
        title: 'View',
        shortcuts: VIEW_MODES.map(({ id, label, key }) => ({ id, label, keys: viewModeShortcutKeys(key) })),
    },
];

const ShortcutsView = () => (
    <div className="sidebar-view shortcuts-view">
        {groups.map((group) => {
            const headingId = `shortcuts-group-${group.id}`;
            return (
                <section key={group.id} aria-labelledby={headingId}>
                    <h3 id={headingId} className="shortcuts-group-title">
                        {group.title}
                    </h3>
                    <div className="shortcuts-list">
                        {group.shortcuts.map((shortcut) => (
                            <div
                                key={`${group.id}-${shortcut.id}`}
                                className="shortcut-row"
                            >
                                <span>{shortcut.label}</span>
                                <div className="shortcut-keys">
                                    {shortcut.keys.map((key, keyIndex) => (
                                        <React.Fragment key={keyIndex}>
                                            <kbd className="shortcut-key">
                                                {key}
                                            </kbd>
                                            {keyIndex < shortcut.keys.length - 1 && (
                                                <span className="shortcut-plus">+</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            );
        })}
    </div>
);

export default ShortcutsView;
