export type ViewMode = "split" | "editor" | "preview";
export type FontFamily = "mono" | "sans" | "serif";

export interface WorkspaceSettings {
    viewMode: ViewMode;
    swapPanels: boolean;
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

export interface InterpreterSettings {
    gfm: boolean;
    breaks: boolean;
    allowHtml: boolean;
    codeHighlight: boolean;
    syncScroll: boolean;
}

export interface AppSettings {
    workspace: WorkspaceSettings;
    editor: EditorSettings;
    interpreter: InterpreterSettings;
}