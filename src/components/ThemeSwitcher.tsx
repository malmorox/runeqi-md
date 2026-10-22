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
            className={`
                relative w-11 h-6 flex items-center rounded-md
                cursor-pointer outline outline-[#252526] transition-colors
                ${isDark ? "bg-[#2d2d30]" : "bg-white"}
            `}
        >
            <span
                className={`
                    absolute w-4.5 h-4.5 bg-[#D4D4D4] border border-[#252526] rounded-sm shadow
                    transition-transform
                    ${isDark ? "translate-x-[22.5px]" : "translate-x-[3.5px]"}
                `}
            />
        </button>
    );
}