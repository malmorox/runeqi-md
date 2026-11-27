import type { MenuItem } from '@/types/sidebar';

interface SidebarMenuItemProps {
    item: MenuItem;
    // Defaults to the item's own onClick
    onSelect?: () => void;
}

// Sidebar menu row: icon, label and description. Rows with an inline control (e.g. the theme switch)
// aren't clickable themselves, since a button can't hold another one: the control is.
const SidebarMenuItem = ({ item, onSelect = item.onClick }: SidebarMenuItemProps) => {
    // Spans instead of divs/paragraphs: a button can only hold phrasing content
    const content = (
        <>
            <span className="sidebar-item-icon">
                <item.icon size={18} aria-hidden />
            </span>
            <span className="sidebar-item-text">
                <span className="sidebar-item-label">{item.label}</span>
                {item.description && (
                    <span className="sidebar-item-description">
                        {item.description}
                    </span>
                )}
            </span>
            {item.inlineComponent && (
                <span className="sidebar-item-icon">
                    {item.inlineComponent}
                </span>
            )}
        </>
    );

    if (item.inlineComponent) {
        return (
            <div className="sidebar-item" data-disabled={item.disabled || undefined}>
                {content}
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={item.disabled}
            className="sidebar-item"
        >
            {content}
        </button>
    );
};

export default SidebarMenuItem;
