import { useContext } from "react";
import { ActiveFileContext } from "@contexts/ActiveFileContext";

export function useActiveFile() {
    const context = useContext(ActiveFileContext);
    if (!context) throw new Error("useActiveFile debe usarse dentro de ActiveFileProvider");
    return context;
}