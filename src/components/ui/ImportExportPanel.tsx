import { useRef, useState } from 'react';
import { MdContentCopy, MdFileUpload } from 'react-icons/md';
import { FaFilePdf, FaHtml5, FaMarkdown } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import SidebarMenuItem from '@components/ui/SidebarMenuItem';
import { ACCEPTED_MARKDOWN_TYPES, exportMarkdown, importMarkdownFiles, markdownFileName } from '@helpers/markdownFiles';
import { copyAsHtml, exportHtml, printDocument } from '@helpers/documentExport';
import { useSettings } from '@hooks/useSettings';
import { useMarkdown } from '@hooks/useMarkdown';
import { useActiveFile } from '@hooks/useActiveFile';
import { useActiveFileEntry } from '@hooks/files/useActiveFileEntry';
import { useAlerts } from '@hooks/useAlerts';
import { listRejections, storageErrorMessage } from '@utils/alertMessages';
import type { FileSystemEntry } from '@/types/file';

type ExportKind = 'markdown' | 'html' | 'pdf' | 'copy';

// Import/Export view of the sidebar: Markdown files from the computer go to the root, and the active file is exported
// as Markdown, HTML or PDF, or copied as formatted text
const ImportExportPanel = () => {
    const { markdown } = useMarkdown();
    const activeEntry = useActiveFileEntry();
    const { setActiveFileId } = useActiveFile();
    const alerts = useAlerts();
    const { settings } = useSettings();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    // One export at a time: a second "Save as" dialog can't be opened meanwhile, and the document is rendered once
    const [exporting, setExporting] = useState<ExportKind | null>(null);

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
    const handleSave = async (kind: 'markdown' | 'html') => {
        if (!activeEntry) return;
        setExporting(kind);
        try {
            const result = kind === 'markdown'
                ? await exportMarkdown(activeEntry.name, markdown)
                : await exportHtml(activeEntry.name, markdown, settings);
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
            setExporting(null);
        }
    };

    // The print dialog says nothing about how it ends, so only a failure to open it is reported
    const handlePrint = async () => {
        if (!activeEntry) return;
        setExporting('pdf');
        try {
            await printDocument(activeEntry.name, markdown, settings);
        } catch (error) {
            console.error(error);
            alerts.error({ title: "The print dialog couldn't be opened", message: 'Try again in a moment.' });
        } finally {
            setExporting(null);
        }
    };

    const handleCopy = async () => {
        setExporting('copy');
        try {
            await copyAsHtml(markdown, settings);
            alerts.success({ title: 'Copied as HTML', message: 'Paste it into an email, Google Docs or Notion.' });
        } catch (error) {
            console.error(error);
            alerts.error({
                title: "The document couldn't be copied",
                message: "The browser didn't allow access to the clipboard. Try again, or export the file as HTML instead.",
            });
        } finally {
            setExporting(null);
        }
    };

    // The editor's content is used instead of the stored one, which is saved with a small delay
    const isEmpty = !markdown.trim();
    // The entry is missing for a moment while the file list loads
    const canExport = !!activeEntry && !isEmpty && exporting === null;

    const exportItems: { kind: ExportKind; icon: IconType; label: string; description: string; onClick: () => void }[] = [
        {
            kind: 'markdown',
            icon: FaMarkdown,
            label: 'Export as Markdown',
            description: activeEntry
                ? `Save "${markdownFileName(activeEntry.name)}" to your computer.`
                : 'Save the current file to your computer.',
            onClick: () => handleSave('markdown'),
        },
        {
            kind: 'html',
            icon: FaHtml5,
            label: 'Export as HTML',
            description: 'A web page with its images included, that opens in any browser.',
            onClick: () => handleSave('html'),
        },
        {
            kind: 'pdf',
            icon: FaFilePdf,
            label: 'Export as PDF',
            description: 'Opens the print dialog: choose "Save as PDF" as the printer.',
            onClick: handlePrint,
        },
        {
            kind: 'copy',
            icon: MdContentCopy,
            label: 'Copy as HTML',
            description: 'Paste it with its format into an email, Google Docs or Notion.',
            onClick: handleCopy,
        },
    ];

    // While a document is being rendered (formulas, diagrams and images can take a moment), its row says so
    const describe = ({ kind, description }: { kind: ExportKind; description: string }) => {
        if (isEmpty) return 'The current file is empty.';
        if (exporting === kind && kind !== 'markdown') return 'Preparing the document…';
        return description;
    };

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

            {exportItems.map((item) => (
                <SidebarMenuItem
                    key={item.kind}
                    item={{
                        icon: item.icon,
                        label: item.label,
                        description: describe(item),
                        onClick: item.onClick,
                        disabled: !canExport
                    }}
                />
            ))}
        </div>
    );
};

export default ImportExportPanel;
