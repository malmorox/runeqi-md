import React, { createContext, useMemo, useState } from "react";

export type ViewMode = "split" | "editor" | "preview";

export type Settings = {
  workspace: {
    viewMode: ViewMode;
    swapPanels: boolean;
  };
  editor: {
    wordWrap: boolean;
    lineNumbers: boolean;
    minimap: boolean;
  };
  interpreter: {
    gfm: boolean;
    breaks: boolean;
    allowHtml: boolean;
  };
};

const DEFAULT_UI_SETTINGS: Settings = {
  workspace: { viewMode: "split", swapPanels: false },
  editor: { wordWrap: true, lineNumbers: true, minimap: false },
  interpreter: { gfm: true, breaks: true, allowHtml: false },
};

type SettingsContextValue = {
  Settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  resetSettings: () => void;
};

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [Settings, setSettings] = useState<Settings>(DEFAULT_UI_SETTINGS);

  const resetSettings = () => setSettings(DEFAULT_UI_SETTINGS);

  const value = useMemo(
    () => ({ Settings, setSettings, resetSettings }),
    [Settings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};