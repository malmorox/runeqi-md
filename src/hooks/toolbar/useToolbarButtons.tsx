import { headingOptions } from '@constants/toolbar';
import {
    FaTextHeight, 
    FaBold, 
    FaItalic, 
    FaStrikethrough, 
    FaQuoteRight,
    FaLink, 
    FaRegImage, 
    FaListUl, 
    FaListOl, 
    FaListCheck
} from 'react-icons/fa6';
import { IoCode } from 'react-icons/io5';
import { PiCodeBlockBold } from 'react-icons/pi';
import { MdInsertEmoticon } from 'react-icons/md';
import { BiTable } from 'react-icons/bi';
import TableRowsColumnsSelector from '@components/ui/TableRowsColumnsSelector';
import CodeLanguageSelector from '@components/ui/CodeLanguageSelector';
import EmojiPicker from '@components/ui/EmojiPicker';
import { HeadingContent, ImageContent, InputContent } from '@components/ui/ToolbarDropdownsContent';
import { useMarkdownActions } from '@hooks/markdown/useMarkdownActions';
import { saveImage } from '@helpers/images';
import { imageAlt, imageMarkdownPath } from '@utils/imagePaths';
import { SHORTCUTS } from '@constants/shortcuts';
import { formatShortcut } from '@utils/shortcuts';
import type { ToolbarButton } from '@/types/toolbar';
import type { ShortcutDefinition } from '@/types/shortcut';

interface UseToolbarButtonsParams {
    closeDropdown: () => void;
}

export const useToolbarButtons = ({ closeDropdown }: UseToolbarButtonsParams): ToolbarButton[] => {
    const actions = useMarkdownActions();

    const handleHeadingSelect = (level: 1 | 2 | 3 | 4 | 5 | 6, label: string) => {
        actions.insertHeading(level, label);
        closeDropdown();
    };

    const handleLinkInsert = (values: Record<string, string>) => {
        actions.insertLink(values.text, values.url);
        closeDropdown();
    };

    const handleImageInsert = (alt: string, url: string) => {
        actions.insertImage(alt, url);
        closeDropdown();
    };

    // Saves the image into the Images folder (throws if it's rejected, so the dropdown can show why)
    const handleImageUpload = async (file: File, alt: string) => {
        const entry = await saveImage(file);
        actions.insertImage(alt || imageAlt(entry.name), imageMarkdownPath(entry.name));
        closeDropdown();
    };

    const handleCodeBlockSelect = (language: string) => {
        actions.insertCodeBlock(language);
        closeDropdown();
    };

    const handleTableSelect = (selection: { rows: number; cols: number }) => {
        actions.insertTable(selection.rows, selection.cols);
        closeDropdown();
    };

    const buildTooltip = ({ label, key }: ShortcutDefinition) => `${label} – ${formatShortcut(key)}`;

    return [
        {
            type: 'dropdown',
            icon: FaTextHeight,
            iconSize: 20,
            tooltip: buildTooltip(SHORTCUTS.heading),
            name: 'heading',
            dropdownContent: (
                <HeadingContent 
                    options={headingOptions}
                    onSelect={handleHeadingSelect}
                />
            )
        },
        {
            type: 'action',
            icon: FaBold,
            iconSize: 18,
            tooltip: buildTooltip(SHORTCUTS.bold),
            name: 'bold',
            onClick: () => actions.insertBold()
        },
        {
            type: 'action',
            icon: FaItalic,
            iconSize: 18,
            tooltip: buildTooltip(SHORTCUTS.italic),
            name: 'italic',
            onClick: () => actions.insertItalic()
        },
        {
            type: 'action',
            icon: FaStrikethrough,
            iconSize: 18,
            tooltip: buildTooltip(SHORTCUTS.strikethrough),
            name: 'strikethrough',
            onClick: () => actions.insertStrikethrough()
        },
        {
            type: 'action',
            icon: FaQuoteRight,
            iconSize: 18,
            tooltip: buildTooltip(SHORTCUTS.quote),
            name: 'quote',
            onClick: () => actions.insertQuote()
        },
        {
            type: 'action',
            icon: IoCode,
            iconSize: 22,
            tooltip: buildTooltip(SHORTCUTS.code),
            name: 'code',
            onClick: () => actions.insertCode()
        },
        {
            type: 'dropdown',
            icon: FaLink,
            iconSize: 20,
            tooltip: buildTooltip(SHORTCUTS.link),
            name: 'link',
            dropdownContent: (
                <InputContent
                    fields={[
                        { name: 'text', label: 'Link text', placeholder: 'Ex: Go to site' },
                        { name: 'url', label: 'Link URL', placeholder: 'https://example.com' }
                    ]}
                    onSubmit={handleLinkInsert}
                />
            )
        },
        {
            type: 'action',
            icon: FaListUl,
            iconSize: 18,
            tooltip: buildTooltip(SHORTCUTS['unordered-list']),
            name: 'unordered-list',
            onClick: () => actions.insertUnorderedList()
        },
        {
            type: 'action',
            icon: FaListOl,
            iconSize: 18,
            tooltip: buildTooltip(SHORTCUTS['ordered-list']),
            name: 'ordered-list',
            onClick: () => actions.insertOrderedList()
        },
        {
            type: 'action',
            icon: FaListCheck,
            iconSize: 18,
            tooltip: buildTooltip(SHORTCUTS['task-list']),
            name: 'task-list',
            onClick: () => actions.insertTaskList()
        },
        {
            type: 'dropdown',
            icon: PiCodeBlockBold,
            iconSize: 20,
            tooltip: buildTooltip(SHORTCUTS.codeblock),
            name: 'codeblock',
            dropdownContent: <CodeLanguageSelector onSelect={handleCodeBlockSelect} />
        },
        {
            type: 'dropdown',
            icon: BiTable,
            iconSize: 21,
            tooltip: buildTooltip(SHORTCUTS.table),
            name: 'table',
            dropdownContent: <TableRowsColumnsSelector onSelect={handleTableSelect} />
        },
        {
            type: 'dropdown',
            icon: FaRegImage,
            iconSize: 18,
            tooltip: buildTooltip(SHORTCUTS.image),
            name: 'image',
            dropdownContent: <ImageContent onSubmit={handleImageInsert} onUpload={handleImageUpload} />
        },
        {
            type: 'dropdown',
            icon: MdInsertEmoticon,
            iconSize: 21,
            tooltip: buildTooltip(SHORTCUTS.emoji),
            name: 'emoji',
            dropdownContent: <EmojiPicker onSelect={actions.insertEmoji} />
        }
    ];
}