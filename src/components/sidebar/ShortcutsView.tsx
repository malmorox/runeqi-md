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
    <div className="overflow-y-auto space-y-4 flex-1 p-3">
        {groups.map((group) => {
            const headingId = `shortcuts-group-${group.id}`;
            return (
                <section key={group.id} aria-labelledby={headingId}>
                    <h3 id={headingId} className="font-semibold text-[#252526] mb-2">
                        {group.title}
                    </h3>
                    <div className="space-y-2">
                        {group.shortcuts.map((shortcut) => (
                            <div
                                key={`${group.id}-${shortcut.id}`}
                                className="flex items-center justify-between py-2 px-3 bg-[#C4C4C4] rounded"
                            >
                                <span className="text-md">{shortcut.label}</span>
                                <div className="flex">
                                    {shortcut.keys.map((key, keyIndex) => (
                                        <React.Fragment key={keyIndex}>
                                            <kbd className="px-2 py-1 text-xs font-semibold text-[#252526] bg-[#D4D4D4] border border-[#2d2d30] rounded">
                                                {key}
                                            </kbd>
                                            {keyIndex < shortcut.keys.length - 1 && (
                                                <span className="text-[#2d2d30] px-1">+</span>
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
