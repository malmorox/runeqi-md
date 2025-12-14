import { useState } from 'react';
import { FaTimes, FaChevronLeft } from 'react-icons/fa';
import type { MenuView, MenuItem } from '@/types/sidebar';
import SidebarContent from '@components/ui/SidebarContent';
import { mainMenuItems, viewTitles } from '@config/sidebarData';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const [currentView, setCurrentView] = useState<MenuView>('main');

    if (!isOpen) return null;

    const handleMenuItemClick = (item: MenuItem) => {
        if (item.hasSubview && item.view) {
            setCurrentView(item.view);
        } else if (item.onClick) {
            item.onClick();
        }
    };

    return (
        <aside className="h-full w-100 bg-[#D4D4D4] text-[#252526] z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center h-12 px-4 pr-3 bg-[#bbbbbb]">
                {currentView !== 'main' && (
                    <button
                        onClick={() => setCurrentView('main')}
                        className="p-1 hover:bg-[#3a3a3a] rounded transition-colors cursor-pointer"
                    >
                        <FaChevronLeft size={20} />
                    </button>
                )}
                <span className="text-lg font-semibold flex-1">
                    {viewTitles[currentView]}
                </span>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-[#A8A8A8] rounded transition-colors cursor-pointer"
                >
                    <FaTimes size={20} color="#2d2d30" />
                </button>
            </div>
            {/* Contenido */}
            <SidebarContent 
                currentView={currentView} 
                mainMenuItems={mainMenuItems} 
                onMenuItemClick={handleMenuItemClick}
            />
        </aside>
    );
};

export default Sidebar;