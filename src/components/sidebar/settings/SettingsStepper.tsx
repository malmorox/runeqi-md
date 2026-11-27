import { FaMinus, FaPlus } from 'react-icons/fa6';

// − value + control. The buttons turn off at the limits, so the value can't leave the range
const SettingsStepper = ({
    label,
    value,
    min,
    max,
    step = 1,
    unit = '',
    onChange
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (v: number) => void;
}) => (
    <div className="settings-row">
        <span>{label}</span>
        <div role="group" aria-label={label} className="settings-stepper">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - step))}
                disabled={value <= min}
                className="settings-stepper-button"
                aria-label={`Decrease ${label.toLowerCase()}`}
            >
                <FaMinus size={10} aria-hidden />
            </button>
            <span className="settings-stepper-value" aria-live="polite">
                {value}{unit}
            </span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + step))}
                disabled={value >= max}
                className="settings-stepper-button"
                aria-label={`Increase ${label.toLowerCase()}`}
            >
                <FaPlus size={10} aria-hidden />
            </button>
        </div>
    </div>
);

export default SettingsStepper;
