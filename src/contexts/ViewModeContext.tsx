import { createContext, useEffect, useState } from "react";
import type { ViewMode } from "@/types/viewMode";

type ViewModeContextType = {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
};

export const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

// Kept apart from the settings: resetting them doesn't change the view
const STORAGE_KEY = "runeqi-view-mode";
export const DEFAULT_VIEW_MODE: ViewMode = "split";

const isViewMode = (value: unknown): value is ViewMode =>
    value === "split" || value === "editor" || value === "preview";

// Storage can be blocked (private mode, cleared site data): the default view is used then
function loadViewMode(): ViewMode {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return isViewMode(stored) ? stored : DEFAULT_VIEW_MODE;
    } catch {
        return DEFAULT_VIEW_MODE;
    }
}

export const ViewModeProvider = ({ children }: { children: React.ReactNode }) => {
    const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, viewMode);
        } catch {
            // Not saved: the view still applies until the page is reloaded
        }
    }, [viewMode]);

    return (
        <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
            {children}
        </ViewModeContext.Provider>
    );
}
