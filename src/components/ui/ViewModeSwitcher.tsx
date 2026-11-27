import { useViewMode } from '@hooks/useViewMode';
import { useViewModeShortcuts } from '@hooks/workspace/useViewModeShortcuts';
import { VIEW_MODES } from '@constants/viewModes';
import { formatViewModeShortcut } from '@utils/shortcuts';

const ViewModeSwitcher = () => {
    const { viewMode, setViewMode } = useViewMode();
    useViewModeShortcuts();

    const activeIndex = Math.max(0, VIEW_MODES.findIndex(({ id }) => id === viewMode));

    return (
        <div
            role="group"
            aria-label="View mode"
            className="view-mode-switcher"
        >
            <span
                aria-hidden="true"
                data-mode={VIEW_MODES[activeIndex].id}
                className="view-mode-thumb"
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
                        className="view-mode-button"
                    >
                        <Icon size={16} />
                    </button>
                );
            })}
        </div>
    );
};

export default ViewModeSwitcher;
