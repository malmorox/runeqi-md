import { useEffect, useRef, useState } from 'react';
import { MdCheck, MdOutlineContentCopy } from 'react-icons/md';
import type { CheatsheetEntry } from '@/types/cheatsheet';
import { CHEATSHEET, REQUIREMENT_SETTING_LABELS } from '@constants/cheatsheet';
import { useSettings } from '@hooks/useSettings';
import { useAlerts } from '@hooks/useAlerts';

const COPIED_FEEDBACK_MS = 1500;

interface CheatsheetCopyButtonProps {
    entry: CheatsheetEntry;
}

const CheatsheetCopyButton = ({ entry }: CheatsheetCopyButtonProps) => {
    const alerts = useAlerts();
    const [copied, setCopied] = useState(false);
    const copiedTimer = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(entry.syntax);
            setCopied(true);
            window.clearTimeout(copiedTimer.current);
            copiedTimer.current = window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
        } catch {
            alerts.error({
                title: "It couldn't be copied",
                message: "The browser didn't allow access to the clipboard. Select the text and copy it instead.",
            });
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={handleCopy}
                className={`shrink-0 p-1 rounded text-[#2d2d30] cursor-pointer hover:bg-[#bbbbbb] focus-visible:outline-2 focus-visible:outline-sky-500 ${
                    copied
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100'
                }`}
                title={copied ? 'Copied' : 'Copy'}
                aria-label={`Copy ${entry.label.toLowerCase()}`}
            >
                {copied ? <MdCheck size={14} aria-hidden /> : <MdOutlineContentCopy size={14} aria-hidden />}
            </button>
            <span className="sr-only" role="status">{copied ? 'Copied' : ''}</span>
        </>
    );
};

// Markdown Cheatsheet view of the sidebar: the syntax the preview draws, as the editor shows it, ready to copy
const CheatsheetView = () => {
    const { settings } = useSettings();

    return (
        <div className="overflow-y-auto flex-1 p-3 space-y-8">
            {CHEATSHEET.map((section) => {
                const headingId = `cheatsheet-section-${section.id}`;
                const missingSettings = [...new Set(section.entries.flatMap((entry) =>
                    entry.requires && !settings.previewer[entry.requires] ? [entry.requires] : []
                ))].map((requirement) => `"${REQUIREMENT_SETTING_LABELS[requirement]}"`);

                return (
                    <section key={section.id} aria-labelledby={headingId}>
                        <h3
                            id={headingId}
                            className="pb-1 mb-3 text-lg font-bold text-[#252526] border-b border-dashed border-[#2d2d30]/40"
                        >
                            {section.title}
                        </h3>
                        {missingSettings.length > 0 && (
                            <p className="-mt-2 mb-3 text-[11px] text-[#595959]">
                                Dimmed lines need {missingSettings.join(' and ')} in Settings.
                            </p>
                        )}
                        <ul className="space-y-3">
                            {section.entries.map((entry) => {
                                const isOff = entry.requires !== undefined && !settings.previewer[entry.requires];
                                return (
                                    // `relative` keeps the sr-only status inside the line: otherwise it's positioned
                                    // against the page and, far down the list, makes the whole page scroll
                                    <li
                                        key={entry.label}
                                        className={`group relative flex items-start gap-2 text-sm text-[#252526] ${isOff ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex-1 min-w-0 wrap-break-word">{entry.line}</div>
                                        <CheatsheetCopyButton entry={entry} />
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                );
            })}
        </div>
    );
};

export default CheatsheetView;
