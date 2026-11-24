export type FontFamily = "mono" | "sans" | "serif";

export interface WorkspaceSettings {
    syncScroll: boolean;
}

export interface EditorSettings {
    fontSize: number;
    fontFamily: FontFamily;
    lineHeight: number;
    tabSize: number;
    wordWrap: boolean;
    lineNumbers: boolean;
    minimap: boolean;
}

export interface PreviewerSettings {
    gfm: boolean;
    breaks: boolean;
    allowHtml: boolean;
    codeHighlight: boolean;
    // $...$ and $$...$$ formulas (KaTeX). Off for documents that use $ for prices
    math: boolean;
}

export interface PrivacySettings {
    usageData: boolean;
}

export interface AppSettings {
    workspace: WorkspaceSettings;
    editor: EditorSettings;
    previewer: PreviewerSettings;
    privacy: PrivacySettings;
}