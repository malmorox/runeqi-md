import { useEffect, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import { HiCheckCircle, HiExclamationTriangle, HiInformationCircle, HiXCircle, HiXMark } from 'react-icons/hi2';
import type { AlertItem, AlertVariant } from '@/types/alert';

// The status color is only on the icon, the left edge and the timer bar: actions and focus rings keep the app's sky accent.
// The icon and the title (plus a hidden prefix for screen readers) tell the status too, not just the color
const VARIANTS: Record<AlertVariant, { icon: IconType; label: string; accent: string; iconDark: string; iconLight: string }> = {
    success: { icon: HiCheckCircle, label: 'Success', accent: 'bg-emerald-500', iconDark: 'text-emerald-400', iconLight: 'text-emerald-600' },
    error: { icon: HiXCircle, label: 'Error', accent: 'bg-red-500', iconDark: 'text-red-400', iconLight: 'text-red-600' },
    warning: { icon: HiExclamationTriangle, label: 'Warning', accent: 'bg-amber-500', iconDark: 'text-amber-400', iconLight: 'text-amber-600' },
    info: { icon: HiInformationCircle, label: 'Info', accent: 'bg-sky-500', iconDark: 'text-sky-400', iconLight: 'text-sky-600' },
};

// Follows the editor's theme, with the same greys as the rest of the app
const SURFACES = {
    dark: {
        toast: 'bg-[#252526] border-[#3e3e42] shadow-black/40',
        title: 'text-white',
        message: 'text-[#cccccc]',
        action: 'text-sky-400 hover:bg-sky-400/10',
        close: 'text-[#bbbbbb] hover:text-white hover:bg-[#3e3e42]',
    },
    light: {
        toast: 'bg-white border-[#d4d4d4] shadow-black/10',
        title: 'text-[#1e1e1e]',
        message: 'text-[#3c3c3c]',
        action: 'text-sky-700 hover:bg-sky-500/10',
        close: 'text-[#616161] hover:text-[#1e1e1e] hover:bg-[#ececec]',
    },
};

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500';

interface AlertToastProps {
    alert: AlertItem;
    isDark: boolean;
    onDismiss: () => void;
}

// A single alert. It goes away on its own after its duration, which stops counting while
// the pointer is over it or it has the keyboard focus, so it can be read and its buttons used
const AlertToast = ({ alert, isDark, onDismiss }: AlertToastProps) => {
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
    const surface = isDark ? SURFACES.dark : SURFACES.light;
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
            className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 rounded-lg border py-3 pl-4 pr-2 shadow-lg ${surface.toast} ${
                alert.isLeaving
                    ? 'pointer-events-none motion-safe:animate-alert-out motion-reduce:animate-alert-fade-out'
                    : 'motion-safe:animate-alert-in motion-reduce:animate-alert-fade-in'
            }`}
        >
            <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${variant.accent}`} />
            <Icon aria-hidden size={20} className={`shrink-0 mt-px ${isDark ? variant.iconDark : variant.iconLight}`} />

            {/* Errors interrupt the screen reader; the rest wait for it to finish */}
            <div role={alert.variant === 'error' ? 'alert' : 'status'} aria-atomic className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-5 wrap-break-word ${surface.title}`}>
                    <span className="sr-only">{variant.label}: </span>
                    {alert.title}
                </p>
                {alert.message && (
                    // Lists (e.g. the rejected files) come one per line
                    <p className={`mt-0.5 text-sm leading-5 whitespace-pre-line wrap-break-word ${surface.message}`}>
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
                        className={`mt-1.5 -ml-2 px-2 py-1 rounded text-sm font-semibold transition-colors duration-150 cursor-pointer ${FOCUS_RING} ${surface.action}`}
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
                className={`shrink-0 -my-1 size-7 flex items-center justify-center rounded transition-colors duration-150 cursor-pointer ${FOCUS_RING} ${surface.close}`}
            >
                <HiXMark aria-hidden size={18} />
            </button>

            {/* Time left before it goes away, stopped together with the timer */}
            <span
                aria-hidden
                className={`absolute bottom-0 left-0 h-0.5 w-full origin-left opacity-60 motion-reduce:hidden ${variant.accent}`}
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
