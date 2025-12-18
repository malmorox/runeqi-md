import React, { createContext, useMemo, useState } from "react";

export type ViewMode = "split" | "editor" | "preview";

export type settings = {
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

const DEFAULT_UI_SETTINGS: settings = {
  workspace: { viewMode: "split", swapPanels: false },
  editor: { wordWrap: true, lineNumbers: true, minimap: false },
  interpreter: { gfm: true, breaks: false, allowHtml: true },
};

type SettingsContextValue = {
  settings: settings;
  setSettings: React.Dispatch<React.SetStateAction<settings>>;
  resetSettings: () => void;
};

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<settings>(DEFAULT_UI_SETTINGS);

  const resetSettings = () => setSettings(DEFAULT_UI_SETTINGS);

  const value = useMemo(
    () => ({ settings, setSettings, resetSettings }),
    [settings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};