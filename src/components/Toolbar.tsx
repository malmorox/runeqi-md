import React, { useState, useRef, useEffect } from 'react';
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
    FaListCheck,
    FaTrash
} from 'react-icons/fa6';
import { IoCode } from "react-icons/io5";
import { PiCodeBlockBold } from "react-icons/pi";
import { MdInsertEmoticon } from "react-icons/md";
import { BiTable } from "react-icons/bi";
import { LuUndo, LuRedo } from "react-icons/lu";
import { SlOptions } from "react-icons/sl";
import type { ToolbarButton } from '@/types/toolbar';
import TableRowsColumnsSelector from '@components/ui/TableRowsColumnsSelector';
import CodeLanguageSelector from '@components/ui/CodeLanguageSelector';
import EmojiPicker from '@components/ui/EmojiPicker';
import { HeadingContent, InputContent } from '@components/ui/ToolbarDropdownsContent';
import { useMarkdown } from '@hooks/useMarkdown';
import { useEditor } from "@hooks/useEditor";
import { useSettings } from "@hooks/useSettings";
import { useMarkdownActions } from "@hooks/useMarkdownActions";
import ClearMarkdownModal from "@components/ui/ClearMarkdownModal";
import { SHORTCUTS } from '@constants/shortcuts';

interface MarkdownToolbarProps {
    onInsert: (markdown: string, cursorOffset?: number) => void;
    onSidebarToggle: () => void;
    isSidebarOpen: boolean;
}

interface DropdownProps {
    isOpen: boolean;
    children: React.ReactNode;
}

const Dropdown = ({ isOpen, children }: DropdownProps) => {
    if (!isOpen) return null;
    
    return (
        <div className="absolute top-full left-0 mt-3 bg-[#252526] border border-[#bbbbbb] rounded-lg shadow-lg z-10">
            {children}
        </div>
    );
};

const Toolbar = ({ onInsert, onSidebarToggle, isSidebarOpen }: MarkdownToolbarProps) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const actions = useMarkdownActions({ onInsert });
    const { undo, redo, canUndo, canRedo } = useEditor();
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const { markdown } = useMarkdown();
    const { settings } = useSettings();

    const isMarkdownEmpty = markdown.trim() === "";
    const isEditorVisible = settings.workspace.viewMode === 'editor' || settings.workspace.viewMode === 'split';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

    const toggleDropdown = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const closeDropdown = () => {
        setOpenDropdown(null);
    };

    // Manejadores
    const handleHeadingSelect = (level: 1 | 2 | 3 | 4 | 5 | 6, label: string) => {
        actions.insertHeading(level, label);
        closeDropdown();
    };

    const handleLinkInsert = (values: Record<string, string>) => {
        actions.insertLink(values.text, values.url);
        closeDropdown();
    };

    const handleImageInsert = (values: Record<string, string>) => {
        actions.insertImage(values.alt, values.url);
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

    const formatShortcutKeys = (keys: string[]) => keys.join('+');

    // Botones del la barra de herramientas
    const toolbarButtons: ToolbarButton[] = [
        {
            type: 'dropdown',
            icon: FaTextHeight,
            iconSize: 20,
            tooltip: `${SHORTCUTS.heading.label} – ${formatShortcutKeys(SHORTCUTS.heading.keys)}`,
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
            tooltip: `${SHORTCUTS.bold.label} – ${formatShortcutKeys(SHORTCUTS.bold.keys)}`,
            name: 'bold',
            onClick: () => actions.insertBold()
        },
        {
            type: 'action',
            icon: FaItalic,
            iconSize: 18,
            tooltip: `${SHORTCUTS.italic.label} – ${formatShortcutKeys(SHORTCUTS.italic.keys)}`,
            name: 'italic',
            onClick: () => actions.insertItalic()
        },
        {
            type: 'action',
            icon: FaStrikethrough,
            iconSize: 18,
            tooltip: `${SHORTCUTS.strikethrough.label} – ${formatShortcutKeys(SHORTCUTS.strikethrough.keys)}`,
            name: 'strikethrough',
            onClick: () => actions.insertStrikethrough()
        },
        {
            type: 'action',
            icon: FaQuoteRight,
            iconSize: 18,
            tooltip: `${SHORTCUTS.quote.label} – ${formatShortcutKeys(SHORTCUTS.quote.keys)}`,
            name: 'quote',
            onClick: () => actions.insertQuote()
        },
        {
            type: 'action',
            icon: IoCode,
            iconSize: 22,
            tooltip: `${SHORTCUTS.code.label} – ${formatShortcutKeys(SHORTCUTS.code.keys)}`,
            name: 'code',
            onClick: () => actions.insertCode()
        },
        {
            type: 'dropdown',
            icon: FaLink,
            iconSize: 20,
            tooltip: `${SHORTCUTS.link.label} – ${formatShortcutKeys(SHORTCUTS.link.keys)}`,
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
            tooltip: `${SHORTCUTS['unordered-list'].label} – ${formatShortcutKeys(SHORTCUTS['unordered-list'].keys)}`,
            name: 'unordered-list',
            onClick: () => actions.insertUnorderedList()
        },
        {
            type: 'action',
            icon: FaListOl,
            iconSize: 18,
            tooltip: `${SHORTCUTS['ordered-list'].label} – ${formatShortcutKeys(SHORTCUTS['ordered-list'].keys)}`,
            name: 'ordered-list',
            onClick: () => actions.insertOrderedList()
        },
        {
            type: 'action',
            icon: FaListCheck,
            iconSize: 18,
            tooltip: `${SHORTCUTS['task-list'].label} – ${formatShortcutKeys(SHORTCUTS['task-list'].keys)}`,
            name: 'task-list',
            onClick: () => actions.insertTaskList()
        },
        {
            type: 'dropdown',
            icon: PiCodeBlockBold,
            iconSize: 20,
            tooltip: `${SHORTCUTS.codeblock.label} – ${formatShortcutKeys(SHORTCUTS.codeblock.keys)}`,
            name: 'codeblock',
            dropdownContent: <CodeLanguageSelector onSelect={handleCodeBlockSelect} />
        },
        {
            type: 'dropdown',
            icon: BiTable,
            iconSize: 21,
            tooltip: `${SHORTCUTS.table.label} – ${formatShortcutKeys(SHORTCUTS.table.keys)}`,
            name: 'table',
            dropdownContent: <TableRowsColumnsSelector onSelect={handleTableSelect} />
        },
        {
            type: 'dropdown',
            icon: FaRegImage,
            iconSize: 18,
            tooltip: `${SHORTCUTS.image.label} – ${formatShortcutKeys(SHORTCUTS.image.keys)}`,
            name: 'image',
            dropdownContent:  (
                <InputContent
                    fields={[
                        { name: 'alt', label: 'Alt text', placeholder: 'Description' },
                        { name: 'url', label: 'Image URL', placeholder: 'https://example.com/image.jpg' }
                    ]}
                    onSubmit={handleImageInsert}
                />
            )
        },
        {
            type: 'dropdown',
            icon: MdInsertEmoticon,
            iconSize: 21,
            tooltip: `${SHORTCUTS.emoji.label} – ${formatShortcutKeys(SHORTCUTS.emoji.keys)}`,
            name: 'emoji',
            dropdownContent: <EmojiPicker onSelect={actions.insertEmoji} />
        }
    ];

    return (
        <>
            <div className="bg-[#1e1e1e] px-2 py-1 flex gap-1 items-center justify-between" ref={dropdownRef}>
                {isEditorVisible && (
                    <nav className="flex gap-0.5 items-center">
                        <button
                            onClick={undo}
                            disabled={!canUndo}
                            className={`
                                w-10 aspect-square p-2 rounded transition-colors
                                flex items-center justify-center
                                ${canUndo
                                    ? 'text-[#bbbbbb] hover:bg-[#4d4d4d] cursor-pointer'
                                    : 'text-[#555] cursor-not-allowed opacity-50'}
                            `}
                            title="Undo"
                        >
                            <LuUndo size={24} />
                        </button>

                        <button
                            onClick={redo}
                            disabled={!canRedo}
                            className={`
                                w-10 aspect-square p-2 rounded transition-colors
                                flex items-center justify-center
                                ${canRedo
                                    ? 'text-[#bbbbbb] hover:bg-[#4d4d4d] cursor-pointer'
                                    : 'text-[#555] cursor-not-allowed opacity-50'}
                            `}
                            title="Redo"
                        >
                            <LuRedo size={24} />
                        </button>

                        <div className="w-px h-6 bg-[#4d4d4d] mx-1" />

                        {toolbarButtons.map((button, index) => (
                            <React.Fragment key={button.name}>
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            if (button.type === 'action') {
                                                closeDropdown();
                                                button.onClick();
                                            } else {
                                                toggleDropdown(button.name);
                                            }
                                        }}
                                        className="w-10 aspect-square group p-2 hover:bg-[#4d4d4d] rounded transition-colors flex items-center justify-center cursor-pointer"
                                        title={button.tooltip}
                                    >
                                        <button.icon size={button.iconSize} className="text-[#bbbbbb] group-hover:text-white transition-colors" />
                                    </button>
                                    {button.type === 'dropdown' && (
                                        <Dropdown isOpen={openDropdown === button.name}>
                                            {button.dropdownContent}
                                        </Dropdown>
                                    )}
                                </div>
                                {(index === 6 || index === 9) && (
                                    <div className="w-px h-6 bg-[#4d4d4d] mx-1" />
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}
                <div className="flex items-center gap-1 ml-auto shrink-0">
                    <button
                        onClick={() => {
                            if (isMarkdownEmpty) return;
                            closeDropdown();
                            setIsClearModalOpen(true)
                        }}
                        className={`w-10 aspect-square p-2 rounded flex items-center justify-center transition-colors
                            ${isMarkdownEmpty ? 'text-[#555] cursor-not-allowed opacity-50' : 'text-[#bbbbbb] hover:bg-[#4d4d4d] cursor-pointer'}`}
                        title="Clear markdown"
                    >
                        <FaTrash size={18} />
                    </button>

                    <button
                        onClick={onSidebarToggle}
                        className={`
                            w-10 aspect-square p-2 rounded flex items-center justify-center transition-colors cursor-pointer
                            ${isSidebarOpen
                                ? 'bg-[#4d4d4d] text-white'
                                : 'text-[#bbbbbb] hover:bg-[#4d4d4d]'
                            }
                        `}
                        title="Toggle sidebar"
                    >
                        <SlOptions size={20} />
                    </button>
                </div>
            </div>
            <ClearMarkdownModal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
            />
        </>
    );
};

export default Toolbar;