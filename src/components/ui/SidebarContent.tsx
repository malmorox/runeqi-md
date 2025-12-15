import React from 'react';
import type { MenuItem, MenuView } from '@/types/sidebar';
import { shortcuts } from '@/config/sidebarData';

interface SidebarContentProps {
    currentView: MenuView;
    mainMenuItems: MenuItem[];
    onMenuItemClick: (item: MenuItem) => void;
}

const SidebarContent = ({ 
    currentView, 
    mainMenuItems, 
    onMenuItemClick 
}: SidebarContentProps) => {
    
    switch (currentView) {
        case 'main':
            return (
                <div className="overflow-y-auto flex-1 p-3">
                    {mainMenuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => onMenuItemClick(item)}
                            className={`w-full flex items-start gap-3 px-4 py-3 rounded-md transition-colors text-left ${
                                item.inlineComponent 
                                    ? 'cursor-default' 
                                    : 'cursor-pointer hover:bg-[#C4C4C4]'
                            }`}
                        >
                            <div className="shrink-0 flex items-center self-stretch">
                                <item.icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="font-medium">{item.label}</span>
                                {item.description && (
                                    <p className="text-xs text-[#2d2d30] mt-0.5">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                            {item.inlineComponent && (
                                <div className="shrink-0 flex items-center self-stretch">
                                    {item.inlineComponent}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );

        case 'shortcuts':
            return (
                <div className="overflow-y-auto flex-1 p-3">
                    <div className="space-y-2">
                        {shortcuts.map((shortcut, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between py-2 px-3 bg-[#C4C4C4] rounded"
                            >
                                <span className="text-md">{shortcut.action}</span>
                                <div className="flex gap-1">
                                    {shortcut.keys.map((key, keyIndex) => (
                                        <React.Fragment key={keyIndex}>
                                            <kbd className="px-2 py-1 text-xs font-semibold text-[#252526] bg-[#D4D4D4] border border-[#2d2d30] rounded">
                                                {key}
                                            </kbd>
                                            {keyIndex < shortcut.keys.length - 1 && (
                                                <span className="text-[#2d2d30] px-1">+</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        default:
            return null;
    }
};

export default SidebarContent;