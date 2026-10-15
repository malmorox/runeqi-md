import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = import.meta.env.MIXPANEL_TOKEN;

mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: true,
    record_sessions_percent: 100,
    api_host: 'https://api-eu.mixpanel.com',
})

mixpanel.identify();

export default mixpanel;