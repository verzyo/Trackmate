import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { getTodayUTC } from "@/utils/date.utils";

/**
 * Returns a Date representing the current UTC day.
 * Re-computes when the day changes (via 60s interval) or when the app becomes active.
 */
export function useToday(): Date {
	const [today, setToday] = useState(getTodayUTC);

	useEffect(() => {
		const refresh = () => {
			const now = getTodayUTC();
			setToday((prev) => {
				if (prev.getTime() !== now.getTime()) return now;
				return prev;
			});
		};

		const interval = setInterval(refresh, 60_000);

		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") refresh();
		});

		return () => {
			clearInterval(interval);
			subscription.remove();
		};
	}, []);

	return today;
}
