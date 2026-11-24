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

export default SettingsToggle;
