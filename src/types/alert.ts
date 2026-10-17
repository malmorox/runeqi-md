export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertAction {
    label: string;
    onClick: () => void;
}

export interface AlertOptions {
    title: string;
    message?: string;
    // A single follow-up the user can take from the alert itself (e.g. "Undo")
    action?: AlertAction;
    // Milliseconds it stays on screen, paused while hovered or focused. Defaults to the variant's
    duration?: number;
}

export interface AlertItem extends AlertOptions {
    id: number;
    variant: AlertVariant;
    duration: number;
    // Playing its exit animation, about to be removed
    isLeaving: boolean;
}
