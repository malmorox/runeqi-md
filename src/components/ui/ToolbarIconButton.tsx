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
        className={`
            w-10 aspect-square p-2 rounded flex items-center justify-center transition-colors
            ${disabled
                ? 'text-[#555] cursor-not-allowed opacity-50'
                : 'text-[#bbbbbb] hover:bg-[#4d4d4d] hover:text-white cursor-pointer'}
        `}
        title={title}
    >
        <Icon size={iconSize} />
    </button>
);

export default ToolbarIconButton;