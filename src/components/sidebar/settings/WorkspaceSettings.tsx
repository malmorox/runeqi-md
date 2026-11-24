import { useSettings } from '@hooks/useSettings';
import SettingsSection from '@components/sidebar/settings/SettingsSection';
import SettingsToggle from '@components/sidebar/settings/SettingsToggle';

const WorkspaceSettings = () => {
    const { settings, updateSettings } = useSettings();

    return (
        <SettingsSection
            title="Workspace"
            description="Choose how the editor and preview work together. Sync scroll applies in split view."
        >
            <SettingsToggle
                label="Sync scroll"
                checked={settings.workspace.syncScroll}
                onChange={v => updateSettings({ workspace: { syncScroll: v } })}
            />
        </SettingsSection>
    );
};

export default WorkspaceSettings;
