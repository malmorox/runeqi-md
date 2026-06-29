import React from 'react';
import type { MenuItem, MenuView } from '@/types/sidebar';
import { SHORTCUTS } from '@constants/shortcuts';
import { useSettings } from '@hooks/useSettings';

const shortcuts = Object.values(SHORTCUTS);

interface SidebarContentProps {
    currentView: MenuView;
    mainMenuItems: MenuItem[];
    onMenuItemClick: (item: MenuItem) => void;
}

const SettingsSection = ({
    title,
    description,
    children
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) => (
    <section className="bg-[#C4C4C4] rounded-md p-3 space-y-2">
        <div>
            <div className="font-semibold text-[#252526]">{title}</div>
            <p className="text-xs text-[#2d2d30] mt-0.5 mb-3">{description}</p>
        </div>
        {children}
    </section>
);

const SettingsToggle = ({
    label,
    checked,
    onChange
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) => (
    <label className="flex items-center gap-2 text-sm text-[#252526] cursor-pointer">
        <input
            type="checkbox"
            checked={checked}
            onChange={e => onChange(e.target.checked)}
        />
        {label}
    </label>
);

const SidebarContent = ({
    currentView,
    mainMenuItems,
    onMenuItemClick
}: SidebarContentProps) => {
    const { settings, updateSettings, resetSettings } = useSettings();

    switch (currentView) {
        case 'main':
            return (
                <div className="overflow-y-auto flex-1 p-3">
                    {mainMenuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                if (!item.disabled) onMenuItemClick(item);
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
                <div className="overflow-y-auto space-y-2 flex-1 p-3">
                    <div className="mb-3 px-3 py-2 bg-[#fcd527] rounded-md text-xs text-[#252526] border border-[#2d2d30]">
                        Keyboard shortcuts are coming in a future update.
                    </div>
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

        case 'settings':
            return (
                <div className="overflow-y-auto flex-1 p-3 space-y-3">
                    <SettingsSection title="Workspace" description="Choose how you want to work with the editor and preview.">
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
                                        onClick={() => updateSettings({ workspace: { viewMode: mode } })}
                                        className={`px-1.5 py-0.5 text-sm rounded border border-[#2d2d30] cursor-pointer ${
                                            settings.workspace.viewMode === mode
                                                ? 'bg-[#D4D4D4]'
                                                : 'bg-[#bbbbbb] hover:bg-[#D4D4D4]'
                                        }`}
                                    >
                                        {labels[mode]}
                                    </button>
                                );
                            })}
                        </div>
                        {settings.workspace.viewMode === 'split' && (
                            <SettingsToggle
                                label="Sync scroll with editor"
                                checked={settings.workspace.syncScroll}
                                onChange={v => updateSettings({ workspace: { syncScroll: v } })}
                            />
                        )}
                    </SettingsSection>
                    
                    {(settings.workspace.viewMode === 'split' || settings.workspace.viewMode === 'editor') && (
                        <SettingsSection title="Editor" description="Customize how the editor looks and feels while you write.">
                            <SettingsToggle
                                label="Wrap long lines"
                                checked={settings.editor.wordWrap}
                                onChange={v => updateSettings({ editor: { wordWrap: v } })}
                            />
                            <SettingsToggle
                                label="Show line numbers"
                                checked={settings.editor.lineNumbers}
                                onChange={v => updateSettings({ editor: { lineNumbers: v } })}
                            />
                            <SettingsToggle
                                label="Show minimap"
                                checked={settings.editor.minimap}
                                onChange={v => updateSettings({ editor: { minimap: v } })}
                            />
                        </SettingsSection>
                    )}

                    {(settings.workspace.viewMode === 'split' || settings.workspace.viewMode === 'preview') && (
                        <SettingsSection title="Preview" description="Control how your document is displayed in the preview.">
                            <SettingsToggle
                                label="Enable tables and task lists"
                                checked={settings.interpreter.gfm}
                                onChange={v => updateSettings({ interpreter: { gfm: v } })}
                            />
                            <SettingsToggle
                                label="Preserve line breaks"
                                checked={settings.interpreter.breaks}
                                onChange={v => updateSettings({ interpreter: { breaks: v } })}
                            />
                            <SettingsToggle
                                label="Allow embedded HTML"
                                checked={settings.interpreter.allowHtml}
                                onChange={v => updateSettings({ interpreter: { allowHtml: v } })}
                            />
                        </SettingsSection>
                    )}

                    <button
                        onClick={resetSettings}
                        className="w-full bg-[#bbbbbb] hover:bg-[#A8A8A8] rounded-md py-2 text-[#252526] font-medium transition-colors cursor-pointer"
                    >
                        Reset to defaults
                    </button>
                </div>
            );

        default:
            return null;
    }
};

export default SidebarContent;