import { useSettings } from '@hooks/useSettings';
import SettingsSection from '@components/sidebar/settings/SettingsSection';
import SettingsToggle from '@components/sidebar/settings/SettingsToggle';

const WorkspaceSettings = () => {
    const { settings, updateSettings } = useSettings();

    return (
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
    );
};

export default WorkspaceSettings;
