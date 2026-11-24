import { useEffect } from "react";
import { useSettings } from "@hooks/useSettings";

// Without consent the analytics chunk is never downloaded, so there is nothing to turn off
let analyticsLoaded = false;

export const useAnalyticsConsent = (): void => {
    const { settings } = useSettings();
    const usageData = settings.privacy.usageData;

    useEffect(() => {
        if (!usageData && !analyticsLoaded) return;

        let cancelled = false;
        analyticsLoaded = true;

        void import("@utils/analytics").then(({ enableAnalytics, disableAnalytics }) => {
            // A quicker toggle already replaced this effect: applying it would restore a stale choice
            if (cancelled) return;
            if (usageData) enableAnalytics();
            else disableAnalytics();
        });

        return () => {
            cancelled = true;
        };
    }, [usageData]);
}
