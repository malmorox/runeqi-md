import { useContext } from "react";
import { ViewModeContext } from "@contexts/ViewModeContext";

export const useViewMode = () => {
    const context = useContext(ViewModeContext);
    if (!context) throw new Error("useViewMode must be used inside <ViewModeProvider>");
    return context;
}
