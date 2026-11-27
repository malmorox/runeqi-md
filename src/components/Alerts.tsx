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
            className={`alerts ${theme === "dark" ? "dark" : ""}`}
        >
            <ol className="alerts-list">
                {alerts.map((alert) => (
                    <AlertToast
                        key={alert.id}
                        alert={alert}
                        onDismiss={() => dismiss(alert.id)}
                    />
                ))}
            </ol>
        </section>
    );
};

export default Alerts;
