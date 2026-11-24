import { useViewMode } from '@hooks/useViewMode';
import { useViewModeShortcuts } from '@hooks/workspace/useViewModeShortcuts';
import { VIEW_MODES } from '@constants/viewModes';
import { formatViewModeShortcut } from '@utils/shortcuts';

// Static class names so Tailwind can detect them; offsets match the w-8 segments.
const THUMB_OFFSETS = ['translate-x-0', 'translate-x-8', 'translate-x-16'];

const ViewModeSwitcher = () => {
    const { viewMode, setViewMode } = useViewMode();
    useViewModeShortcuts();

    const activeIndex = Math.max(0, VIEW_MODES.findIndex(({ id }) => id === viewMode));

    return (
        <div
            role="group"
            aria-label="View mode"
            className="relative inline-flex shrink-0 items-center rounded-md bg-[#2d2d30] border border-[#3c3c3c] p-0.5"
        >
            <span
                aria-hidden="true"
                className={`
                    absolute top-0.5 left-0.5 h-7 w-8 rounded bg-[#4d4d4d] shadow-sm
                    transition-transform duration-200 motion-reduce:transition-none
                    ${THUMB_OFFSETS[activeIndex]}
                `}
            />
            {VIEW_MODES.map(({ id, label, icon: Icon, key }) => {
                const isActive = viewMode === id;
                return (
                    <button
                        key={id}
                        type="button"
                        aria-pressed={isActive}
                        aria-label={label}
                        title={`${label} (${formatViewModeShortcut(key)})`}
                        onClick={() => setViewMode(id)}
                        className={`
                            relative z-10 h-7 w-8 flex items-center justify-center rounded cursor-pointer transition-colors
                            focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500
                            ${isActive ? 'text-white' : 'text-[#8a8a8a] hover:text-[#dddddd]'}
                        `}
                    >
                        <Icon size={16} />
                    </button>
                );
            })}
        </div>
    );
};

export default ViewModeSwitcher;
