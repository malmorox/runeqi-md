import React from 'react';
import { SHORTCUTS } from '@constants/shortcuts';
import { shortcutKeys } from '@utils/shortcuts';

const shortcuts = Object.values(SHORTCUTS).map(({ id, label, key }) => ({ id, label, keys: shortcutKeys(key) }));

const ShortcutsView = () => (
    <div className="overflow-y-auto space-y-2 flex-1 p-3">
        {shortcuts.map((shortcut) => (
            <div
                key={shortcut.id}
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
);

export default ShortcutsView;
