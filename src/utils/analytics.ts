import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = import.meta.env.MIXPANEL_TOKEN;

let initialized = false;
let enabled = false;

export function enableAnalytics(): void {
    if (enabled) return;
    enabled = true;

    if (!initialized) {
        mixpanel.init(MIXPANEL_TOKEN, {
            autocapture: true,
            record_sessions_percent: 100,
            api_host: 'https://api-eu.mixpanel.com',
        });
        initialized = true;
        // Mixpanel keeps the opt-out of an earlier session, and while it holds init doesn't start the recording
        if (mixpanel.has_opted_out_tracking()) {
            mixpanel.opt_in_tracking();
            mixpanel.start_session_recording();
        }
        mixpanel.identify();
        return;
    }

    mixpanel.opt_in_tracking();
    mixpanel.start_session_recording();
}

export function disableAnalytics(): void {
    if (!enabled) return;
    enabled = false;

    mixpanel.stop_session_recording();
    mixpanel.opt_out_tracking();
    // Drops the anonymous distinct_id so a later opt-in starts as a new user
    mixpanel.reset();
}
