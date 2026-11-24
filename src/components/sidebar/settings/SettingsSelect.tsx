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
    <label className="flex items-center justify-between gap-2 text-sm text-[#252526]">
        {label}
        <select
            value={String(value)}
            onChange={e => {
                const option = options.find(o => String(o.value) === e.target.value);
                if (option) onChange(option.value);
            }}
            className="px-1.5 py-0.5 text-sm rounded border border-[#2d2d30] bg-[#bbbbbb] hover:bg-[#D4D4D4] cursor-pointer"
        >
            {options.map(o => (
                <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
            ))}
        </select>
    </label>
);

export default SettingsSelect;
