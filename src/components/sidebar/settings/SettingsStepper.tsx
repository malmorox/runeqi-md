import { FaMinus, FaPlus } from 'react-icons/fa6';

const STEPPER_BUTTON = "px-1.5 self-stretch flex items-center cursor-pointer enabled:hover:bg-[#D4D4D4] disabled:opacity-40 disabled:cursor-not-allowed";

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
    <div className="flex items-center justify-between gap-2 text-sm text-[#252526]">
        <span>{label}</span>
        <div role="group" aria-label={label} className="flex items-center rounded border border-[#2d2d30] bg-[#bbbbbb] overflow-hidden">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - step))}
                disabled={value <= min}
                className={STEPPER_BUTTON}
                aria-label={`Decrease ${label.toLowerCase()}`}
            >
                <FaMinus size={10} aria-hidden />
            </button>
            <span className="min-w-12 px-1 py-0.5 text-center tabular-nums border-x border-[#2d2d30]" aria-live="polite">
                {value}{unit}
            </span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + step))}
                disabled={value >= max}
                className={STEPPER_BUTTON}
                aria-label={`Increase ${label.toLowerCase()}`}
            >
                <FaPlus size={10} aria-hidden />
            </button>
        </div>
    </div>
);

export default SettingsStepper;
