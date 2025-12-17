import { useContext } from "react";
import { MarkdownContext } from "@contexts/MarkdownContext";

export const useMarkdown = () => {
    const context = useContext(MarkdownContext);
    if (!context) throw new Error("useMarkdown must be used inside <MarkdownProvider>");
    return context;
}