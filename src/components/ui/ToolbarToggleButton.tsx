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
        className={`
            w-10 shrink-0 aspect-square p-2 rounded flex items-center justify-center transition-colors cursor-pointer
            ${isActive ? 'bg-[#4d4d4d] text-white' : 'text-[#bbbbbb] hover:bg-[#4d4d4d]'}
        `}
        title={title}
    >
        <Icon size={iconSize} />
    </button>
);

export default ToolbarToggleButton;