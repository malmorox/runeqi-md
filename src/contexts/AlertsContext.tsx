import { createContext, useCallback, useMemo, useState } from "react";
import type { AlertItem, AlertOptions, AlertVariant } from "@/types/alert";
import { ALERT_DURATIONS, ALERT_EXIT_MS, MAX_VISIBLE_ALERTS, MIN_ACTION_ALERT_DURATION } from "@constants/alerts";

// Shows an alert and returns its id (to dismiss it early)
type Notify = (options: AlertOptions) => number;

type AlertsContextType = {
    success: Notify;
    error: Notify;
    warning: Notify;
    info: Notify;
    dismiss: (id: number) => void;
};

export const AlertsContext = createContext<AlertsContextType | undefined>(undefined);
// The visible alerts have their own context: components that only raise alerts don't re-render when the list changes
export const AlertListContext = createContext<AlertItem[] | undefined>(undefined);

let nextAlertId = 0;

const isSameAlert = (a: AlertItem, b: AlertItem) =>
    a.variant === b.variant && a.title === b.title && a.message === b.message;

export const AlertsProvider = ({ children }: { children: React.ReactNode }) => {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);

    // Plays the exit animation, then removes the alert
    const dismiss = useCallback((id: number) => {
        setAlerts(prev => prev.map(a => (a.id === id ? { ...a, isLeaving: true } : a)));
        setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), ALERT_EXIT_MS);
    }, []);

    const notify = useCallback((variant: AlertVariant, options: AlertOptions) => {
        const defaultDuration = options.action
            ? Math.max(ALERT_DURATIONS[variant], MIN_ACTION_ALERT_DURATION)
            : ALERT_DURATIONS[variant];
        const alert: AlertItem = {
            ...options,
            id: nextAlertId++,
            variant,
            duration: options.duration ?? defaultDuration,
            isLeaving: false,
        };

        setAlerts(prev => {
            // The same alert again (e.g. saving failing on every change) takes the old one's place
            // and restarts its timer, instead of piling up copies
            if (prev.some(a => !a.isLeaving && isSameAlert(a, alert))) {
                return prev.map(a => (!a.isLeaving && isSameAlert(a, alert) ? alert : a));
            }
            const next = [...prev, alert];
            // Beyond the limit the oldest one goes away right away
            const visible = next.filter(a => !a.isLeaving);
            if (visible.length <= MAX_VISIBLE_ALERTS) return next;
            return next.filter(a => a !== visible[0]);
        });
        return alert.id;
    }, []);

    const api = useMemo<AlertsContextType>(() => ({
        success: (options) => notify('success', options),
        error: (options) => notify('error', options),
        warning: (options) => notify('warning', options),
        info: (options) => notify('info', options),
        dismiss,
    }), [notify, dismiss]);

    return (
        <AlertsContext.Provider value={api}>
            <AlertListContext.Provider value={alerts}>
                {children}
            </AlertListContext.Provider>
        </AlertsContext.Provider>
    );
}
