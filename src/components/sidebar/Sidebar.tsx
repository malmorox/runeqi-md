import { useState } from 'react';
import { IoSettingsSharp } from "react-icons/io5";
import { FaKeyboard, FaMarkdown, FaPalette } from 'react-icons/fa';
import { FaCircleInfo } from "react-icons/fa6";
import { IoIosSave, IoMdExit } from "react-icons/io";
import type { MenuView, MenuItem } from '@/types/sidebar';
import SidebarHeader from '@components/sidebar/SidebarHeader';
import SidebarContent from '@components/sidebar/SidebarContent';
import ThemeSwitcher from '@components/ThemeSwitcher';
import AboutModal from '@components/ui/AboutModal';
import ResetApplicationModal from '@components/ui/ResetApplicationModal';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const [currentView, setCurrentView] = useState<MenuView>('main');
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);

    if (!isOpen) return null;

    const mainMenuItems: MenuItem[] = [
        {
            icon: FaMarkdown,
            label: 'Markdown Cheatsheet',
            description: 'Markdown syntax at a glance.',
            view: 'cheatsheet',
            hasSubview: true
        },
        {
            icon: FaKeyboard,
            label: 'Keyboard Shortcuts',
            description: 'View all available shortcuts.',
            view: 'shortcuts',
            hasSubview: true
        },
        {
            icon: IoIosSave,
            label: 'Import/Export',
            description: 'Import or export Markdown files.',
            view: 'import-export',
            hasSubview: true
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
        },
        {
            icon: IoMdExit,
            label: 'Reset application',
            onClick: () => setIsResetOpen(true)
        },
        {
            icon: FaCircleInfo,
            label: 'About RuneQi',
            onClick: () => setIsAboutOpen(true)
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
            <aside className="side-panel sidebar">
                {/* Header */}
                <SidebarHeader
                    currentView={currentView}
                    onBack={() => setCurrentView('main')}
                    onClose={onClose}
                />
                {/* Contenido */}
                <SidebarContent
                    currentView={currentView}
                    mainMenuItems={mainMenuItems}
                    onMenuItemClick={handleMenuItemClick}
                />
            </aside>
            {/* Outside the aside: on narrow windows the aside is fixed with its own z-index, which would hold the modals under it */}
            {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}
            {isResetOpen && <ResetApplicationModal onClose={() => setIsResetOpen(false)} />}
        </>
    );
};

export default Sidebar;
