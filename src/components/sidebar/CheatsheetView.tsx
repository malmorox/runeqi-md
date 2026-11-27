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
                data-copied={copied || undefined}
                className="cheatsheet-copy-button"
                title={copied ? 'Copied' : 'Copy'}
                aria-label={`Copy ${entry.label.toLowerCase()}`}
            >
                {copied ? <MdCheck size={14} aria-hidden /> : <MdOutlineContentCopy size={14} aria-hidden />}
            </button>
            <span className="visually-hidden" role="status">{copied ? 'Copied' : ''}</span>
        </>
    );
};

// Markdown Cheatsheet view of the sidebar: the syntax the preview draws, as the editor shows it, ready to copy
const CheatsheetView = () => {
    const { settings } = useSettings();

    return (
        <div className="sidebar-view cheatsheet-view">
            {CHEATSHEET.map((section) => {
                const headingId = `cheatsheet-section-${section.id}`;
                const missingSettings = [...new Set(section.entries.flatMap((entry) =>
                    entry.requires && !settings.previewer[entry.requires] ? [entry.requires] : []
                ))].map((requirement) => `"${REQUIREMENT_SETTING_LABELS[requirement]}"`);

                return (
                    <section key={section.id} aria-labelledby={headingId}>
                        <h3
                            id={headingId}
                            className="cheatsheet-section-title"
                        >
                            {section.title}
                        </h3>
                        {missingSettings.length > 0 && (
                            <p className="cheatsheet-hint">
                                Dimmed lines need {missingSettings.join(' and ')} in Settings.
                            </p>
                        )}
                        <ul className="cheatsheet-list">
                            {section.entries.map((entry) => {
                                const isOff = entry.requires !== undefined && !settings.previewer[entry.requires];
                                return (
                                    <li
                                        key={entry.label}
                                        data-unavailable={isOff || undefined}
                                        className="cheatsheet-entry"
                                    >
                                        <div className="cheatsheet-entry-line">{entry.line}</div>
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
