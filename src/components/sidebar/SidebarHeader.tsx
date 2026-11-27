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
    <div className="panel-header">
        {currentView !== 'main' && (
            <button
                onClick={onBack}
                className="panel-icon-button panel-icon-button-muted"
                title='Back to menu'
            >
                <FaAngleLeft size={20} />
            </button>
        )}
        <span className="panel-header-title">
            {viewTitles[currentView]}
        </span>
        <button
            onClick={onClose}
            className="panel-icon-button panel-icon-button-muted"
            title='Close sidebar'
        >
            <IoClose size={25} />
        </button>
    </div>
);

export default SidebarHeader;
