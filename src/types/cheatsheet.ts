import type { ReactNode } from 'react';
import type { PreviewerSettings } from '@/types/settings';

// Preview settings some syntax depends on: while one is off, the preview doesn't draw that syntax
export type CheatsheetRequirement = keyof Pick<PreviewerSettings, 'gfm' | 'math' | 'allowHtml'>;

export interface CheatsheetEntry {
    // Not shown: the entry's key and the copy button's accessible name
    label: string;
    // The Markdown as it's written: what Copy puts on the clipboard
    syntax: string;
    // The syntax as the editor shows it: grey markers and the text with its effect
    line: ReactNode;
    requires?: CheatsheetRequirement;
}

export interface CheatsheetSection {
    id: string;
    title: string;
    entries: CheatsheetEntry[];
}
