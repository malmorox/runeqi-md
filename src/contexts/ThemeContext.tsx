import { createContext, useState } from "react";
import type { MonacoTheme } from "@/types/monaco";

type ThemeContextType = {
    theme: MonacoTheme;
    setTheme: (t: MonacoTheme) => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<MonacoTheme>("vs-dark");

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}