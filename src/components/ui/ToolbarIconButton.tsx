import type { IconType } from 'react-icons';

interface ToolbarIconButtonProps {
    icon: IconType;
    iconSize?: number;
    onClick: () => void;
    disabled?: boolean;
    title: string;
}

const ToolbarIconButton = ({ icon: Icon, iconSize = 20, onClick, disabled = false, title }: ToolbarIconButtonProps) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="toolbar-icon-button"
        title={title}
    >
        <Icon size={iconSize} />
    </button>
);

export default ToolbarIconButton;