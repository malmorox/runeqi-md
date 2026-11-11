import { lazy, Suspense } from "react";
import MobileLayout from "@layouts/MobileLayout";

// The editor (Monaco, the Markdown renderer...) is most of the bundle: it's only downloaded on desktop,
// so phones and Google's mobile crawler get the small mobile page without it
const DesktopLayout = lazy(() => import("@layouts/DesktopLayout"));

export default function App() {
    const isMobile = window.innerWidth < 1024 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) return <MobileLayout />;

    return (
        <Suspense fallback={<div className="w-screen h-screen bg-[#1e1e1e]" />}>
            <DesktopLayout />
        </Suspense>
    );
}
