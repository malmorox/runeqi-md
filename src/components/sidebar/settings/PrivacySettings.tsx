import { useSettings } from '@hooks/useSettings';
import SettingsSection from '@components/sidebar/settings/SettingsSection';
import SettingsToggle from '@components/sidebar/settings/SettingsToggle';

const PrivacySettings = () => {
    const { settings, updateSettings } = useSettings();

    return (
        <SettingsSection title="Privacy" description="Help improve the editor by sharing anonymous usage data. Your documents are never sent.">
            <SettingsToggle
                label="Send anonymous usage data"
                checked={settings.privacy.usageData}
                onChange={v => updateSettings({ privacy: { usageData: v } })}
            />
        </SettingsSection>
    );
};

export default PrivacySettings;
