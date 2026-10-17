import { useContext } from "react";
import { AlertListContext, AlertsContext } from "@contexts/AlertsContext";

// Raises alerts: alerts.success({ title, message }), alerts.error(...)...
export const useAlerts = () => {
    const context = useContext(AlertsContext);
    if (!context) throw new Error("useAlerts must be used inside <AlertsProvider>");
    return context;
}

// The alerts on screen, for the component that renders them
export const useAlertList = () => {
    const context = useContext(AlertListContext);
    if (!context) throw new Error("useAlertList must be used inside <AlertsProvider>");
    return context;
}
