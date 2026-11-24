import { useSettings } from '@hooks/useSettings';
import SettingsSection from '@components/sidebar/settings/SettingsSection';
import SettingsSelect from '@components/sidebar/settings/SettingsSelect';
import SettingsStepper from '@components/sidebar/settings/SettingsStepper';
import SettingsToggle from '@components/sidebar/settings/SettingsToggle';
import {
    EDITOR_FONT_FAMILY_OPTIONS,
    EDITOR_FONT_SIZE_RANGE,
    EDITOR_LINE_HEIGHT_OPTIONS,
    EDITOR_TAB_SIZE_OPTIONS
} from '@constants/editor';

const EditorSettings = () => {
    const { settings, updateSettings } = useSettings();

    return (
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
    );
};

export default EditorSettings;
