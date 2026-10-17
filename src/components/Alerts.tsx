import AlertToast from "@components/ui/AlertToast";
import { useAlertList, useAlerts } from "@hooks/useAlerts";
import { useTheme } from "@hooks/useTheme";

// Stack of alerts in the bottom-right corner, the newest one at the bottom.
// The area around them lets clicks through to the workspace
const Alerts = () => {
    const alerts = useAlertList();
    const { dismiss } = useAlerts();
    const { theme } = useTheme();

    return (
        <section
            aria-label="Notifications"
            className="fixed bottom-4 right-4 z-110 w-90 max-w-[calc(100vw-2rem)] pointer-events-none"
        >
            <ol className="flex flex-col gap-2">
                {alerts.map((alert) => (
                    <AlertToast
                        key={alert.id}
                        alert={alert}
                        isDark={theme === "vs-dark"}
                        onDismiss={() => dismiss(alert.id)}
                    />
                ))}
            </ol>
        </section>
    );
};

export default Alerts;
