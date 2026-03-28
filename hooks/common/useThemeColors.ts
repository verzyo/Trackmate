import { useColorScheme } from "nativewind";

export function useThemeColors() {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	return {
		actionPrimary: isDark ? "#6366f1" : "#4f46e5",
		actionSecondary: isDark ? "#1e293b" : "#ffffff",
		textStrong: isDark ? "#f1f5f9" : "#0f172a",
		textDefault: isDark ? "#94a3b8" : "#475569",
		textLight: isDark ? "#64748b" : "#94a3b8",
		surfaceBg: isDark ? "#0f172a" : "#f8fafc",
		surfaceFg: isDark ? "#1e293b" : "#ffffff",
		border: isDark ? "#334155" : "#e2e8f0",
		danger: isDark ? "#f87171" : "#ef4444",
		success: isDark ? "#4ade80" : "#22c55e",
	};
}
