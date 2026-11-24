import { useSettings } from '@hooks/useSettings';
import { useAlerts } from '@hooks/useAlerts';
import WorkspaceSettings from '@components/sidebar/settings/WorkspaceSettings';
import EditorSettings from '@components/sidebar/settings/EditorSettings';
import PreviewSettings from '@components/sidebar/settings/PreviewSettings';

const SettingsView = () => {
    const { resetSettings } = useSettings();
    const alerts = useAlerts();

    const handleReset = () => {
        resetSettings();
        alerts.success({ title: 'Settings reset', message: 'All preferences are back to their defaults.' });
    };

    return (
        <div className="overflow-y-auto flex-1 p-3 space-y-3">
            <WorkspaceSettings />
            <EditorSettings />
            <PreviewSettings />
            <button
                onClick={handleReset}
                className="w-full bg-[#bbbbbb] hover:bg-[#A8A8A8] rounded-md py-2 text-[#252526] font-medium transition-colors cursor-pointer"
            >
                Reset to defaults
            </button>
        </div>
    );
};

export default SettingsView;
