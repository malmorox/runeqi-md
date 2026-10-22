export type ViewMode = "split" | "editor" | "preview";
export type FontFamily = "mono" | "sans" | "serif";

export interface WorkspaceSettings {
    viewMode: ViewMode;
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
}

export interface AppSettings {
    workspace: WorkspaceSettings;
    editor: EditorSettings;
    previewer: PreviewerSettings;
}