const SettingsToggle = ({
    label,
    checked,
    onChange
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) => (
    <label className="settings-toggle">
        <input
            type="checkbox"
            checked={checked}
            onChange={e => onChange(e.target.checked)}
        />
        {label}
    </label>
);

export default SettingsToggle;
