import type { AlertVariant } from '@/types/alert';

// Errors and warnings stay longer: they usually come with something to read (e.g. the files that were rejected)
export const ALERT_DURATIONS: Record<AlertVariant, number> = {
    success: 4000,
    info: 5000,
    warning: 7000,
    error: 8000,
};
// Alerts with an action (e.g. "Undo") get at least this long, so there's time to use it
export const MIN_ACTION_ALERT_DURATION = 6000;
// Older alerts are dropped beyond this, so the stack never covers too much of the workspace
export const MAX_VISIBLE_ALERTS = 4;
// Length of the exit animation (alert-out in index.css)
export const ALERT_EXIT_MS = 150;
// Rejected files listed in an alert before summing up the rest ("…and 3 more")
export const MAX_LISTED_REJECTIONS = 3;
