import { createContext, useEffect, useState } from "react";
import type { Theme } from "@/types/theme";

type ThemeContextType = {
    theme: Theme;
    setTheme: (t: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Kept apart from the settings: resetting them doesn't change the theme
const STORAGE_KEY = "runeqi-theme";
const DEFAULT_THEME: Theme = "dark";

const isTheme = (value: unknown): value is Theme => value === "dark" || value === "light";

// Storage can be blocked (private mode, cleared site data): the default theme is used then
function loadTheme(): Theme {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return isTheme(stored) ? stored : DEFAULT_THEME;
    } catch {
        return DEFAULT_THEME;
    }
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(loadTheme);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Not saved: the theme still applies until the page is reloaded
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
