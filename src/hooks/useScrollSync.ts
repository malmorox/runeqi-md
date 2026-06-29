import { useContext } from "react";
import { ScrollSyncContext } from "@contexts/ScrollSyncContext";

export const useScrollSync = () => {
    const context = useContext(ScrollSyncContext);
    if (!context) throw new Error('useScrollSync must be used within ScrollSyncProvider');
    return context;
};