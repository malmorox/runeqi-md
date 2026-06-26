import MobileLayout from "@layouts/MobileLayout";
import DesktopLayout from "@layouts/DesktopLayout";

export default function App() {
    const isMobile = window.innerWidth < 1024 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
