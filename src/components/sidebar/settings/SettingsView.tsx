import { useSettings } from '@hooks/useSettings';
import { useAlerts } from '@hooks/useAlerts';
import WorkspaceSettings from '@components/sidebar/settings/WorkspaceSettings';
import EditorSettings from '@components/sidebar/settings/EditorSettings';
import PreviewSettings from '@components/sidebar/settings/PreviewSettings';
import PrivacySettings from '@components/sidebar/settings/PrivacySettings';

const SettingsView = () => {
    const { resetSettings } = useSettings();
    const alerts = useAlerts();

    const handleReset = () => {
        resetSettings();
        alerts.success({ title: 'Settings reset', message: 'All preferences are back to their defaults.' });
    };

    return (
        <div className="sidebar-view settings-view">
            <WorkspaceSettings />
            <EditorSettings />
            <PreviewSettings />
            <PrivacySettings />
            <button
                onClick={handleReset}
                className="settings-reset-button"
            >
                Reset to defaults
            </button>
        </div>
    );
};

export default SettingsView;
