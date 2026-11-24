import MobileLayout from "@layouts/MobileLayout";
import DesktopLayout from "@layouts/DesktopLayout";
import { useAnalyticsConsent } from "@hooks/useAnalyticsConsent";

export default function App() {
    useAnalyticsConsent();

    const isMobile = window.innerWidth < 1024 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
