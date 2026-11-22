import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import type { PreviewerSettings } from "@/types/settings";

// Plugins for the preview's settings. The preview and the exports use the same ones, so an exported document
// looks like the preview
export const getRemarkPlugins = ({ gfm, breaks, math }: Pick<PreviewerSettings, "gfm" | "breaks" | "math">) => [
    ...(gfm ? [remarkGfm] : []),
    ...(breaks ? [remarkBreaks] : []),
    // $...$ and $$...$$ formulas, drawn by MathFormula (see markdownComponents)
    ...(math ? [remarkMath] : []),
];

export const getRehypePlugins = ({ allowHtml }: Pick<PreviewerSettings, "allowHtml">) => (allowHtml ? [rehypeRaw] : []);
