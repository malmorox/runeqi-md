import type { MenuItem } from '@/types/sidebar';

interface SidebarMenuItemProps {
    item: MenuItem;
    // Defaults to the item's own onClick
    onSelect?: () => void;
}

const ROW = "w-full flex items-start gap-3 px-4 py-3 rounded-md text-left transition-colors";

// Sidebar menu row: icon, label and description. Rows with an inline control (e.g. the theme switch)
// aren't clickable themselves, since a button can't hold another one: the control is.
const SidebarMenuItem = ({ item, onSelect = item.onClick }: SidebarMenuItemProps) => {
    // Spans instead of divs/paragraphs: a button can only hold phrasing content
    const content = (
        <>
            <span className="shrink-0 flex items-center self-stretch">
                <item.icon size={18} aria-hidden />
            </span>
            <span className="flex-1 min-w-0">
                <span className="block font-medium">{item.label}</span>
                {item.description && (
                    <span className="block text-xs text-[#2d2d30] mt-0.5 wrap-break-word">
                        {item.description}
                    </span>
                )}
            </span>
            {item.inlineComponent && (
                <span className="shrink-0 flex items-center self-stretch">
                    {item.inlineComponent}
                </span>
            )}
        </>
    );

    if (item.inlineComponent) {
        return (
            <div className={`${ROW} ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-default'}`}>
                {content}
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={item.disabled}
            className={`${ROW} cursor-pointer enabled:hover:bg-[#C4C4C4] focus-visible:outline-2 focus-visible:outline-sky-500 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {content}
        </button>
    );
};

export default SidebarMenuItem;
