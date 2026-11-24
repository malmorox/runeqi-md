import { useSettings } from '@hooks/useSettings';
import SettingsSection from '@components/sidebar/settings/SettingsSection';
import SettingsToggle from '@components/sidebar/settings/SettingsToggle';

const PreviewSettings = () => {
    const { settings, updateSettings } = useSettings();

    return (
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
    );
};

export default PreviewSettings;
