import React from 'react';
import type { MenuItem, MenuView } from '@/types/sidebar';
import { SHORTCUTS } from '@/config/shortcuts';
import { useSettings } from '@hooks/useSettings';

const shortcuts = Object.values(SHORTCUTS);

interface SidebarContentProps {
    currentView: MenuView;
    mainMenuItems: MenuItem[];
    onMenuItemClick: (item: MenuItem) => void;
}

const SidebarContent = ({ 
    currentView, 
    mainMenuItems, 
    onMenuItemClick 
}: SidebarContentProps) => {
    const { Settings, setSettings, resetSettings } = useSettings();
    
    switch (currentView) {
        case 'main':
            return (
                <div className="overflow-y-auto flex-1 p-3">
                    {mainMenuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                if (!item.disabled) {
                                    onMenuItemClick(item);
                                }
                            }}
                            className={`w-full flex items-start gap-3 px-4 py-3 rounded-md text-left transition-colors
                                ${item.disabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : item.inlineComponent
                                        ? 'cursor-default'
                                        : 'cursor-pointer hover:bg-[#C4C4C4]'
                                }
                            `}
                        >
                            <div className="shrink-0 flex items-center self-stretch">
                                <item.icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="font-medium">{item.label}</span>
                                {item.description && (
                                    <p className="text-xs text-[#2d2d30] mt-0.5">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                            {item.inlineComponent && (
                                <div className="shrink-0 flex items-center self-stretch">
                                    {item.inlineComponent}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );

        case 'shortcuts':
            return (
                <div className="overflow-y-auto flex-1 p-3">
                    <div className="space-y-2">
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
                </div>
            );
        
        case 'settings':
            return (
                <div className="overflow-y-auto flex-1 p-3 space-y-3">

                {/* WORKSPACE */}
                <section className="bg-[#C4C4C4] rounded-md p-3">
                    <div className="font-semibold text-[#252526]">Workspace</div>
                    <p className="text-xs text-[#2d2d30] mt-0.5 mb-3">
                        Choose how you want to work with the editor and preview.
                    </p>

                    <div className="flex gap-2 flex-wrap">
                        {(['split', 'editor', 'preview'] as const).map(mode => {
                            const labels = {
                                split: 'Split View',
                                editor: 'Editor Only',
                                preview: 'Preview Only'
                            };
                            return (
                                <button
                                    key={mode}
                                    onClick={() =>
                                        setSettings(s => ({
                                        ...s,
                                        workspace: {
                                            ...s.workspace,
                                            viewMode: mode,
                                            swapPanels: mode === "split" ? s.workspace.swapPanels : false,
                                        },
                                        }))
                                    }
                                    className={`px-1.5 py-0.5 text-sm rounded border border-[#2d2d30] cursor-pointer ${
                                        Settings.workspace.viewMode === mode
                                            ? 'bg-[#D4D4D4]'
                                            : 'bg-[#bbbbbb] hover:bg-[#D4D4D4]'
                                    }`}
                                >
                                    {labels[mode]}
                                </button>
                            );
                        })}
                    </div>
                    
                    {Settings.workspace.viewMode === "split" && (
                        <label className="mt-3 flex items-center gap-2 text-sm text-[#252526]">
                            <input
                                type="checkbox"
                                checked={Settings.workspace.swapPanels}
                                onChange={(e) =>
                                setSettings((s) => ({
                                    ...s,
                                    workspace: { ...s.workspace, swapPanels: e.target.checked },
                                }))
                                }
                            />
                            Swap panels (show preview on the left)
                        </label>
                    )}
                </section>

                {/* EDITOR */}
                <section className="bg-[#C4C4C4] rounded-md p-3">
                    <div className="font-semibold text-[#252526]">Editor</div>
                    <p className="text-xs text-[#2d2d30] mt-0.5 mb-3">
                        Customize how the editor looks and feels while you write.
                    </p>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-[#252526]">
                            <input
                                type="checkbox"
                                checked={Settings.editor.wordWrap}
                                onChange={(e) =>
                                    setSettings(s => ({
                                    ...s,
                                    editor: { ...s.editor, wordWrap: e.target.checked }
                                    }))
                                }
                            />
                            Wrap long lines
                        </label>

                        <label className="flex items-center gap-2 text-sm text-[#252526]">
                            <input
                                type="checkbox"
                                checked={Settings.editor.lineNumbers}
                                onChange={(e) =>
                                    setSettings(s => ({
                                    ...s,
                                    editor: { ...s.editor, lineNumbers: e.target.checked }
                                    }))
                                }
                            />
                            Show line numbers
                        </label>

                        <label className="flex items-center gap-2 text-sm text-[#252526]">
                            <input
                                type="checkbox"
                                checked={Settings.editor.minimap}
                                onChange={(e) =>
                                    setSettings(s => ({
                                    ...s,
                                    editor: { ...s.editor, minimap: e.target.checked }
                                    }))
                                }
                            />
                            Show minimap
                        </label>
                    </div>
                </section>

                {/* INTERPRETER */}
                <section className="bg-[#C4C4C4] rounded-md p-3">
                    <div className="font-semibold text-[#252526]">Preview</div>
                    <p className="text-xs text-[#2d2d30] mt-0.5 mb-3">
                        Control how your document is displayed in the preview.
                    </p>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-[#252526]">
                            <input
                                type="checkbox"
                                checked={Settings.interpreter.gfm}
                                onChange={(e) =>
                                    setSettings(s => ({
                                    ...s,
                                    interpreter: { ...s.interpreter, gfm: e.target.checked }
                                    }))
                                }
                            />
                            Enable tables and task lists
                        </label>

                        <label className="flex items-center gap-2 text-sm text-[#252526]">
                            <input
                                type="checkbox"
                                checked={Settings.interpreter.breaks}
                                onChange={(e) =>
                                    setSettings(s => ({
                                    ...s,
                                    interpreter: { ...s.interpreter, breaks: e.target.checked }
                                    }))
                                }
                            />
                            Preserve line breaks
                        </label>

                        <label className="flex items-center gap-2 text-sm text-[#252526]">
                            <input
                                type="checkbox"
                                checked={Settings.interpreter.allowHtml}
                                onChange={(e) =>
                                    setSettings(s => ({
                                    ...s,
                                    interpreter: { ...s.interpreter, allowHtml: e.target.checked }
                                    }))
                                }
                            />
                            Allow embedded HTML
                        </label>
                    </div>
                </section>

                <button
                    onClick={resetSettings}
                    className="w-full bg-[#bbbbbb] hover:bg-[#A8A8A8] rounded-md py-2 text-[#252526] font-medium transition-colors cursor-pointer"
                >
                    Reset
                </button>
                </div>
            );

        default:
            return null;
    }
};

export default SidebarContent;