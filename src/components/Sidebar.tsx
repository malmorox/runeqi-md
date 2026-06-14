import { useState } from 'react';
import { IoClose, IoSettingsSharp } from "react-icons/io5";
import { FaKeyboard, FaPalette } from 'react-icons/fa';
import { FaAngleLeft } from "react-icons/fa6";
import { IoIosSave } from "react-icons/io";
import type { MenuView, MenuItem } from '@/types/sidebar';
import SidebarContent from '@components/ui/SidebarContent';
import { viewTitles } from '@constants/sidebarData';
import ExportMarkdownModal from '@components/ui/DownloadModal';
import ThemeSwitcher from '@components/ThemeSwitcher';
import { useMarkdown } from '@hooks/useMarkdown';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const [currentView, setCurrentView] = useState<MenuView>('main');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const { markdown } = useMarkdown();

    if (!isOpen) return null;

    const hasMarkdown = markdown.trim().length > 0;

    const mainMenuItems: MenuItem[] = [
        {
            icon: FaKeyboard,
            label: 'Keyboard Shortcuts',
            description: 'View all available shortcuts.',
            view: 'shortcuts',
            hasSubview: true
        },
        {
            icon: IoIosSave,
            label: 'Export',
            description: 'Export current document.',
            onClick: () => setIsExportModalOpen(true),
            disabled: !hasMarkdown
        },
        {
            icon: FaPalette,
            label: 'Theme',
            description: 'Switch between light and dark mode.',
            inlineComponent: <ThemeSwitcher />
        },
        {
            icon: IoSettingsSharp,
            label: 'Settings',
            description: 'General application preferences.',
            view: 'settings',
            hasSubview: true
        }
    ];

    const handleMenuItemClick = (item: MenuItem) => {
        if (item.hasSubview && item.view) {
            setCurrentView(item.view);
        } else if (item.onClick) {
            item.onClick();
        }
    };

    return (
        <>
            <aside className="fixed inset-y-0 right-0 w-full sm:relative sm:w-80 h-full bg-[#D4D4D4] text-[#252526] z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center h-12 px-3 gap-1 bg-[#bbbbbb]">
                    {currentView !== 'main' && (
                        <button
                            onClick={() => setCurrentView('main')}
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
                {/* Contenido */}
                <SidebarContent 
                    currentView={currentView} 
                    mainMenuItems={mainMenuItems} 
                    onMenuItemClick={handleMenuItemClick}
                />
            </aside>
            <ExportMarkdownModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
            />
        </>
    );
};

export default Sidebar;