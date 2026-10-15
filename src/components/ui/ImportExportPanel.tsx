import { useRef, useState } from 'react';
import { MdFileDownload, MdFileUpload } from 'react-icons/md';
import SidebarMenuItem from '@components/ui/SidebarMenuItem';
import AlertModal from '@components/ui/AlertModal';
import { ACCEPTED_MARKDOWN_TYPES, downloadMarkdown, importMarkdownFiles, markdownFileName } from '@helpers/markdownFiles';
import { useMarkdown } from '@hooks/useMarkdown';
import { useActiveFile } from '@hooks/useActiveFile';
import { useActiveFileEntry } from '@hooks/files/useActiveFileEntry';

// Import/Export view of the sidebar: Markdown files from the computer go to the root, and the active file is exported
const ImportExportPanel = () => {
    const { markdown } = useMarkdown();
    const activeEntry = useActiveFileEntry();
    const { setActiveFileId } = useActiveFile();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);

    // Opens the last imported file, so the result shows right away in the editor
    const handleImport = async (fileList: FileList | null) => {
        const files = Array.from(fileList ?? []);
        if (files.length === 0) return;

        setIsImporting(true);
        try {
            const { saved, errors } = await importMarkdownFiles(files);
            if (errors.length) setImportError(errors.join('\n'));
            if (saved.length) setActiveFileId(saved[saved.length - 1].id);
        } finally {
            setIsImporting(false);
        }
    };

    // The editor's content is used instead of the stored one, which is saved with a small delay
    const isEmpty = !markdown.trim();
    // The entry is missing for a moment while the file list loads
    const exportDescription = isEmpty
        ? 'The current file is empty.'
        : activeEntry
            ? `Save "${markdownFileName(activeEntry.name)}" to your computer.`
            : 'Save the current file to your computer.';

    return (
        <div className="overflow-y-auto flex-1 p-3">
            <SidebarMenuItem
                item={{
                    icon: MdFileUpload,
                    label: 'Import Markdown',
                    description: 'Add .md files from your computer to the root folder.',
                    onClick: () => fileInputRef.current?.click(),
                    disabled: isImporting
                }}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_MARKDOWN_TYPES}
                multiple
                hidden
                onChange={(e) => {
                    handleImport(e.currentTarget.files);
                    // Allows picking the same file again
                    e.currentTarget.value = '';
                }}
            />

            <hr className="my-3 mx-4 border-[#bbbbbb]" />

            <SidebarMenuItem
                item={{
                    icon: MdFileDownload,
                    label: 'Export as Markdown',
                    description: exportDescription,
                    onClick: () => {
                        if (activeEntry) downloadMarkdown(activeEntry.name, markdown);
                    },
                    disabled: !activeEntry || isEmpty
                }}
            />

            {importError && (
                <AlertModal
                    title="Some files couldn't be imported"
                    message={importError}
                    onClose={() => setImportError(null)}
                />
            )}
        </div>
    );
};

export default ImportExportPanel;
