import type { IconType } from 'react-icons';

interface ToolbarToggleButtonProps {
    icon: IconType;
    iconSize?: number;
    isActive: boolean;
    onClick: () => void;
    title: string;
}

const ToolbarToggleButton = ({ icon: Icon, iconSize = 20, isActive, onClick, title }: ToolbarToggleButtonProps) => (
    <button
        onClick={onClick}
        aria-pressed={isActive}
        className="toolbar-toggle-button"
        title={title}
    >
        <Icon size={iconSize} />
    </button>
);

export default ToolbarToggleButton;