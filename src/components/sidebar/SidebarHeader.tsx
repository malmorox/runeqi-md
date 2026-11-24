import { IoClose } from "react-icons/io5";
import { FaAngleLeft } from "react-icons/fa6";
import type { MenuView } from '@/types/sidebar';
import { viewTitles } from '@constants/sidebarData';

interface SidebarHeaderProps {
    currentView: MenuView;
    onBack: () => void;
    onClose: () => void;
}

const SidebarHeader = ({ currentView, onBack, onClose }: SidebarHeaderProps) => (
    <div className="flex items-center h-12 px-3 gap-1 bg-[#bbbbbb]">
        {currentView !== 'main' && (
            <button
                onClick={onBack}
                className="p-1 text-[#2d2d30] hover:bg-[#A8A8A8] rounded transition-colors cursor-pointer"
                title='Back to menu'
            >
                <FaAngleLeft size={20} />
            </button>
        )}
        <span className="text-lg font-semibold flex-1">
            {viewTitles[currentView]}
        </span>
        <button
            onClick={onClose}
            className="p-1 text-[#2d2d30] hover:bg-[#A8A8A8] rounded transition-colors cursor-pointer"
            title='Close sidebar'
        >
            <IoClose size={25} color="#2d2d30" />
        </button>
    </div>
);

export default SidebarHeader;
