import { createContext, useState, useCallback } from "react";

type MarkdownContextType = {
    markdown: string;
    setMarkdown: (value: string) => void;
    clearMarkdown: () => void;
};

export const MarkdownContext = createContext<MarkdownContextType | undefined>(undefined);

export function MarkdownProvider({ children }: { children: React.ReactNode }) {
    const [markdown, setMarkdown] = useState<string>("## Write your markdown here");

    const clearMarkdown = useCallback(() => {
        setMarkdown("");
    }, []);

    return (
        <MarkdownContext.Provider value={{ markdown, setMarkdown, clearMarkdown }}>
        {children}
        </MarkdownContext.Provider>
    );
}