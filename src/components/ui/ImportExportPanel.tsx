import { useRef, useState } from 'react';
import { MdFileDownload, MdFileUpload } from 'react-icons/md';
import SidebarMenuItem from '@components/ui/SidebarMenuItem';
import { ACCEPTED_MARKDOWN_TYPES, exportMarkdown, importMarkdownFiles, markdownFileName } from '@helpers/markdownFiles';
import { useMarkdown } from '@hooks/useMarkdown';
import { useActiveFile } from '@hooks/useActiveFile';
import { useActiveFileEntry } from '@hooks/files/useActiveFileEntry';
import { useAlerts } from '@hooks/useAlerts';
import { listRejections, storageErrorMessage } from '@utils/alertMessages';
import type { FileSystemEntry } from '@/types/file';

// Import/Export view of the sidebar: Markdown files from the computer go to the root, and the active file is exported
const ImportExportPanel = () => {
    const { markdown } = useMarkdown();
    const activeEntry = useActiveFileEntry();
    const { setActiveFileId } = useActiveFile();
    const alerts = useAlerts();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    // The "Save as" dialog is open: a second one can't be opened meanwhile
    const [isExporting, setIsExporting] = useState(false);

    // One alert per import: how many files made it in, and why the rest didn't
    const reportImport = (saved: FileSystemEntry[], errors: string[]) => {
        const total = saved.length + errors.length;
        if (errors.length === 0) {
            const opened = saved[saved.length - 1];
            alerts.success({
                title: saved.length === 1 ? 'File imported' : `${saved.length} files imported`,
                message: saved.length === 1
                    ? `"${opened.name}" is now open in the editor.`
                    : `They're in the root folder, and "${opened.name}" is open in the editor.`,
            });
        } else if (saved.length > 0) {
            alerts.warning({ title: `${saved.length} of ${total} files imported`, message: listRejections(errors) });
        } else {
            alerts.error({
                title: total === 1 ? "The file couldn't be imported" : "The files couldn't be imported",
                message: listRejections(errors),
            });
        }
    };

    // Opens the last imported file, so the result shows right away in the editor
    const handleImport = async (fileList: FileList | null) => {
        const files = Array.from(fileList ?? []);
        if (files.length === 0) return;

        setIsImporting(true);
        try {
            const { saved, errors } = await importMarkdownFiles(files);
            reportImport(saved, errors);
            if (saved.length) setActiveFileId(saved[saved.length - 1].id);
        } catch (error) {
            alerts.error({ title: 'Import failed', message: storageErrorMessage(error) });
        } finally {
            setIsImporting(false);
        }
    };

    // Only a file that has really been saved is reported as exported. Closing the dialog shows nothing
    const handleExport = async () => {
        if (!activeEntry) return;
        setIsExporting(true);
        try {
            const result = await exportMarkdown(activeEntry.name, markdown);
            if (result?.downloaded) {
                // From here the browser handles it (and may ask where to save it): the app can't know how it ends
                alerts.info({ title: 'Download started', message: `Your browser is saving "${result.fileName}".` });
            } else if (result) {
                alerts.success({ title: 'File exported', message: `Saved as "${result.fileName}".` });
            }
        } catch (error) {
            console.error(error);
            alerts.error({
                title: "The file couldn't be exported",
                message: 'It may be open in another program, or the folder may be read-only. Try again or choose another folder.',
            });
        } finally {
            setIsExporting(false);
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
                    onClick: handleExport,
                    disabled: !activeEntry || isEmpty || isExporting
                }}
            />
        </div>
    );
};

export default ImportExportPanel;
