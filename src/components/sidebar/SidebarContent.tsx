import type { MenuItem, MenuView } from '@/types/sidebar';
import SidebarMenuItem from '@components/sidebar/SidebarMenuItem';
import ImportExportView from '@components/sidebar/ImportExportView';
import ShortcutsView from '@components/sidebar/ShortcutsView';
import CheatsheetView from '@components/sidebar/CheatsheetView';
import SettingsView from '@components/sidebar/settings/SettingsView';

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
                    {mainMenuItems.map((item) => (
                        <SidebarMenuItem
                            key={item.label}
                            item={item}
                            onSelect={() => onMenuItemClick(item)}
                        />
                    ))}
                </div>
            );

        case 'cheatsheet':
            return <CheatsheetView />;

        case 'import-export':
            return <ImportExportView />;

        case 'shortcuts':
            return <ShortcutsView />;

        case 'settings':
            return <SettingsView />;
    }
};

export default SidebarContent;
