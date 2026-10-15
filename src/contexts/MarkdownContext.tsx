import { createContext, useState } from "react";

type MarkdownContextType = {
    markdown: string;
    setMarkdown: (value: string) => void;
};

export const MarkdownContext = createContext<MarkdownContextType | undefined>(undefined);

export const MarkdownProvider = ({ children }: { children: React.ReactNode }) => {
    const [markdown, setMarkdown] = useState<string>("");

    return (
        <MarkdownContext.Provider value={{ markdown, setMarkdown }}>
        {children}
        </MarkdownContext.Provider>
    );
}