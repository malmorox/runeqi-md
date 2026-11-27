import { useTheme } from "@hooks/useTheme";
import type { Theme } from "@/types/theme";

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    const isDark = theme === "dark";

    const handleToggle = () => {
        const nextTheme: Theme = isDark ? "light" : "dark";
        setTheme(nextTheme);
    };

    return (
        <button
            onClick={handleToggle}
            aria-pressed={isDark}
            className="theme-switch"
        >
            <span className="theme-switch-thumb" />
        </button>
    );
}