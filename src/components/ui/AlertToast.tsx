import { useEffect, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import { HiCheckCircle, HiExclamationTriangle, HiInformationCircle, HiXCircle, HiXMark } from 'react-icons/hi2';
import type { AlertItem, AlertVariant } from '@/types/alert';

// The icon and the title (plus a hidden prefix for screen readers) tell the status too, not just the color
const VARIANTS: Record<AlertVariant, { icon: IconType; label: string }> = {
    success: { icon: HiCheckCircle, label: 'Success' },
    error: { icon: HiXCircle, label: 'Error' },
    warning: { icon: HiExclamationTriangle, label: 'Warning' },
    info: { icon: HiInformationCircle, label: 'Info' },
};

interface AlertToastProps {
    alert: AlertItem;
    onDismiss: () => void;
}

// A single alert. It goes away on its own after its duration, which stops counting while
// the pointer is over it or it has the keyboard focus, so it can be read and its buttons used
const AlertToast = ({ alert, onDismiss }: AlertToastProps) => {
    const [isHovered, setHovered] = useState(false);
    const [hasFocus, setHasFocus] = useState(false);
    // Time left before it goes away, kept across pauses
    const remainingRef = useRef(alert.duration);
    const isPaused = isHovered || hasFocus;

    useEffect(() => {
        if (isPaused || alert.isLeaving) return;
        const startedAt = Date.now();
        const timer = setTimeout(onDismiss, remainingRef.current);
        return () => {
            clearTimeout(timer);
            remainingRef.current -= Date.now() - startedAt;
        };
    }, [isPaused, alert.isLeaving, onDismiss]);

    const variant = VARIANTS[alert.variant];
    const Icon = variant.icon;
    const action = alert.action;

    return (
        <li
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHasFocus(true)}
            onBlur={(e) => {
                // Moving between its own buttons keeps it paused
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHasFocus(false);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Escape') onDismiss();
            }}
            data-variant={alert.variant}
            data-leaving={alert.isLeaving || undefined}
            className="alert-toast"
        >
            <span aria-hidden className="alert-accent" />
            <Icon aria-hidden size={20} className="alert-icon" />

            {/* Errors interrupt the screen reader; the rest wait for it to finish */}
            <div role={alert.variant === 'error' ? 'alert' : 'status'} aria-atomic className="alert-body">
                <p className="alert-title">
                    <span className="visually-hidden">{variant.label}: </span>
                    {alert.title}
                </p>
                {alert.message && (
                    // Lists (e.g. the rejected files) come one per line
                    <p className="alert-message">
                        {alert.message}
                    </p>
                )}
                {action && (
                    <button
                        type="button"
                        onClick={() => {
                            action.onClick();
                            onDismiss();
                        }}
                        className="alert-action"
                    >
                        {action.label}
                    </button>
                )}
            </div>

            <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss notification"
                title="Dismiss"
                className="alert-close"
            >
                <HiXMark aria-hidden size={18} />
            </button>

            {/* Time left before it goes away, stopped together with the timer */}
            <span
                aria-hidden
                className="alert-progress"
                style={{
                    animationName: 'alert-progress',
                    animationDuration: `${alert.duration}ms`,
                    animationTimingFunction: 'linear',
                    animationFillMode: 'forwards',
                    animationPlayState: isPaused ? 'paused' : 'running',
                }}
            />
        </li>
    );
};

export default AlertToast;
