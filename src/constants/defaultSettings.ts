import type { AppSettings } from "@/types/settings";

export const DEFAULT_SETTINGS: AppSettings = {
    workspace: {
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
    previewer: {
        gfm: true,
        breaks: false,
        allowHtml: true,
        codeHighlight: true,
        math: true
    },
    // Opt-in: no usage data is sent until the user turns it on
    privacy: {
        usageData: false
    },
};