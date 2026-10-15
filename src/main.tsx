import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MarkdownProvider } from "@contexts/MarkdownContext";
import { SettingsProvider } from "@contexts/SettingsContext";
import { EditorProvider } from "@contexts/EditorContext";
import { ThemeProvider } from "@contexts/ThemeContext";
import { ActiveFileProvider } from "@contexts/ActiveFileContext";
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
        <SettingsProvider>
        <MarkdownProvider>
        <EditorProvider>
        <ActiveFileProvider>
            <App />
        </ActiveFileProvider>
        </EditorProvider>
        </MarkdownProvider>
        </SettingsProvider>
        </ThemeProvider>
    </StrictMode>,
)

// La analítica no es crítica: se carga en un chunk aparte después de arrancar la app
void import('@utils/analytics');
