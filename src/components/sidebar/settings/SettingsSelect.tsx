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
    <label className="settings-row">
        {label}
        <select
            value={String(value)}
            onChange={e => {
                const option = options.find(o => String(o.value) === e.target.value);
                if (option) onChange(option.value);
            }}
            className="settings-select"
        >
            {options.map(o => (
                <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
            ))}
        </select>
    </label>
);

export default SettingsSelect;
