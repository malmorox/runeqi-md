import React from 'react';
import type { MenuItem, MenuView } from '@/types/sidebar';
import { SHORTCUTS } from '@constants/shortcuts';
import { shortcutKeys } from '@utils/shortcuts';
import { useSettings } from '@hooks/useSettings';
import { useAlerts } from '@hooks/useAlerts';
import SidebarMenuItem from '@components/ui/SidebarMenuItem';
import ImportExportPanel from '@components/ui/ImportExportPanel';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import {
    EDITOR_FONT_FAMILY_OPTIONS,
    EDITOR_FONT_SIZE_RANGE,
    EDITOR_LINE_HEIGHT_OPTIONS,
    EDITOR_TAB_SIZE_OPTIONS
} from '@constants/editor';

const shortcuts = Object.values(SHORTCUTS).map(({ id, label, key }) => ({ id, label, keys: shortcutKeys(key) }));

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

// The values go through the <select> as strings and come back typed by finding their option
const SettingsSelect = <T extends string | number>({
    label,
    value,
    options,
    onChange
}: {
    label: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
}) => (
    <label className="flex items-center justify-between gap-2 text-sm text-[#252526]">
        {label}
        <select
            value={String(value)}
            onChange={e => {
                const option = options.find(o => String(o.value) === e.target.value);
                if (option) onChange(option.value);
            }}
            className="px-1.5 py-0.5 text-sm rounded border border-[#2d2d30] bg-[#bbbbbb] hover:bg-[#D4D4D4] cursor-pointer"
        >
            {options.map(o => (
                <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
            ))}
        </select>
    </label>
);

const STEPPER_BUTTON = "px-1.5 self-stretch flex items-center cursor-pointer enabled:hover:bg-[#D4D4D4] disabled:opacity-40 disabled:cursor-not-allowed";

// − value + control. The buttons turn off at the limits, so the value can't leave the range
const SettingsStepper = ({
    label,
    value,
    min,
    max,
    step = 1,
    unit = '',
    onChange
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (v: number) => void;
}) => (
    <div className="flex items-center justify-between gap-2 text-sm text-[#252526]">
        <span>{label}</span>
        <div role="group" aria-label={label} className="flex items-center rounded border border-[#2d2d30] bg-[#bbbbbb] overflow-hidden">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - step))}
                disabled={value <= min}
                className={STEPPER_BUTTON}
                aria-label={`Decrease ${label.toLowerCase()}`}
            >
                <FaMinus size={10} aria-hidden />
            </button>
            <span className="min-w-12 px-1 py-0.5 text-center tabular-nums border-x border-[#2d2d30]" aria-live="polite">
                {value}{unit}
            </span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + step))}
                disabled={value >= max}
                className={STEPPER_BUTTON}
                aria-label={`Increase ${label.toLowerCase()}`}
            >
                <FaPlus size={10} aria-hidden />
            </button>
        </div>
    </div>
);

const SidebarContent = ({
    currentView,
    mainMenuItems,
    onMenuItemClick
}: SidebarContentProps) => {
    const { settings, updateSettings, resetSettings } = useSettings();
    const alerts = useAlerts();

    const handleReset = () => {
        resetSettings();
        alerts.success({ title: 'Settings reset', message: 'All preferences are back to their defaults.' });
    };

    switch (currentView) {
        case 'main':
            return (
                <div className="overflow-y-auto flex-1 p-3">
                    {mainMenuItems.map((item) => (
                        <SidebarMenuItem
                            key={item.label}
                            item={item}
                            onSelect={() => onMenuItemClick(item)}
                        />
                    ))}
                </div>
            );

        case 'import-export':
            return <ImportExportPanel />;

        case 'shortcuts':
            return (
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
                                label="Sync scroll"
                                checked={settings.workspace.syncScroll}
                                onChange={v => updateSettings({ workspace: { syncScroll: v } })}
                            />
                        )}
                    </SettingsSection>
                    
                    {(settings.workspace.viewMode === 'split' || settings.workspace.viewMode === 'editor') && (
                        <SettingsSection title="Editor" description="Customize how the editor looks and feels while you write.">
                            <SettingsSelect
                                label="Font"
                                value={settings.editor.fontFamily}
                                options={EDITOR_FONT_FAMILY_OPTIONS}
                                onChange={v => updateSettings({ editor: { fontFamily: v } })}
                            />
                            <SettingsStepper
                                label="Font size"
                                value={settings.editor.fontSize}
                                {...EDITOR_FONT_SIZE_RANGE}
                                unit="px"
                                onChange={v => updateSettings({ editor: { fontSize: v } })}
                            />
                            <SettingsSelect
                                label="Line height"
                                value={settings.editor.lineHeight}
                                options={EDITOR_LINE_HEIGHT_OPTIONS}
                                onChange={v => updateSettings({ editor: { lineHeight: v } })}
                            />
                            <SettingsSelect
                                label="Tab size"
                                value={settings.editor.tabSize}
                                options={EDITOR_TAB_SIZE_OPTIONS}
                                onChange={v => updateSettings({ editor: { tabSize: v } })}
                            />
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
                                checked={settings.previewer.gfm}
                                onChange={v => updateSettings({ previewer: { gfm: v } })}
                            />
                            <SettingsToggle
                                label="Preserve line breaks"
                                checked={settings.previewer.breaks}
                                onChange={v => updateSettings({ previewer: { breaks: v } })}
                            />
                            <SettingsToggle
                                label="Allow embedded HTML"
                                checked={settings.previewer.allowHtml}
                                onChange={v => updateSettings({ previewer: { allowHtml: v } })}
                            />
                            <SettingsToggle
                                label="Highlight code syntax"
                                checked={settings.previewer.codeHighlight}
                                onChange={v => updateSettings({ previewer: { codeHighlight: v } })}
                            />
                            <SettingsToggle
                                label="Render math formulas"
                                checked={settings.previewer.math}
                                onChange={v => updateSettings({ previewer: { math: v } })}
                            />
                        </SettingsSection>
                    )}

                    <button
                        onClick={handleReset}
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