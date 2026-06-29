import type { AppSettings } from "@/types/settings";

export const DEFAULT_SETTINGS: AppSettings = {
    workspace: {
        viewMode: "split",
        syncScroll: true
    },
    editor: {
        fontSize: 14,
        fontFamily: "mono",
        lineHeight: 1.6,
        tabSize: 4,
        wordWrap: true,
        lineNumbers: true,
        minimap: false,
    },
    interpreter: {
        gfm: true,
        breaks: false,
        allowHtml: true,
        codeHighlight: true
    },
};