import React, { createContext, useCallback, useEffect, useState } from "react";
import type { AppSettings, PreviewerSettings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@constants/defaultSettings";

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

type SettingsContextType = {
    settings: AppSettings;
    updateSettings: (patch: DeepPartial<AppSettings>) => void;
    resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = "markdown-editor-settings";

// The preview options used to be saved under `interpreter`
type StoredSettings = DeepPartial<AppSettings> & { interpreter?: DeepPartial<PreviewerSettings> };

function loadSettings(): AppSettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_SETTINGS;
        // Dropping `interpreter` keeps the old key from being saved again
        const { interpreter, ...parsed } = JSON.parse(stored) as StoredSettings;
        if (interpreter && !parsed.previewer) parsed.previewer = interpreter;
        return deepMerge(DEFAULT_SETTINGS, parsed);
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function deepMerge<T extends object>(base: T, override: DeepPartial<T>): T {
    const result = { ...base };
    for (const key in override) {
        const val = override[key];
        if (val && typeof val === "object" && !Array.isArray(val)) {
            result[key] = deepMerge(base[key] as object, val as DeepPartial<object>) as T[typeof key];
        } else if (val !== undefined) {
            result[key] = val as T[typeof key];
        }
    }
    return result;
}

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<AppSettings>(loadSettings);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const updateSettings = useCallback((patch: DeepPartial<AppSettings>) => {
        setSettings(prev => deepMerge(prev, patch));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}