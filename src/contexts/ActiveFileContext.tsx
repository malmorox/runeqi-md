import { createContext, useState } from "react";

type ActiveFileContextType = {
    activeFileId: string | null;
    setActiveFileId: (id: string | null) => void;
};

export const ActiveFileContext = createContext<ActiveFileContextType | undefined>(undefined);

export const ActiveFileProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeFileId, setActiveFileId] = useState<string | null>(null);

    return (
        <ActiveFileContext.Provider value={{ activeFileId, setActiveFileId }}>
            {children}
        </ActiveFileContext.Provider>
    );
}