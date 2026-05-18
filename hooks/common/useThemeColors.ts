import { useColorScheme } from "nativewind";

export function useThemeColors() {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	return {
		actionPrimary: "#4f46e5",
		actionPrimaryFg: "#ffffff",
		actionSecondary: isDark ? "#1e293b" : "#ffffff",
		actionSecondaryFg: isDark ? "#f1f5f9" : "#0f172a",
		textStrong: isDark ? "#f1f5f9" : "#0f172a",
		textDefault: isDark ? "#94a3b8" : "#475569",
		textLight: isDark ? "#64748b" : "#94a3b8",
		surfaceBg: isDark ? "#0f172a" : "#f8fafc",
		surfaceFg: isDark ? "#1e293b" : "#ffffff",
		border: isDark ? "#334155" : "#e2e8f0",
		danger: "#ef4444",
		success: isDark ? "#4ade80" : "#22c55e",
		mutedBg: isDark ? "rgba(148, 163, 184, 0.15)" : "rgba(100, 116, 139, 0.15)",
		mutedFg: isDark ? "#94a3b8" : "#64748b",
		labelBg: isDark ? "#334155" : "#e2e8f0",
		labelFg: isDark ? "#cbd5e1" : "#475569",
	};
}
