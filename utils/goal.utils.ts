import { FREQUENCY_TYPES } from "@/constants/frequencyTypes";
import type { GoalForm } from "@/schemas/goal.schema";

export function transformGoalFormData(data: GoalForm) {
	let activeWeekly: number[] | null = null;
	if (data.frequency_type === FREQUENCY_TYPES.WEEKLY) {
		if (data.weekly_days.length > 0) {
			activeWeekly = data.weekly_days.map((day) => (day === 0 ? 7 : day));
		}
	}

	let frequencyValue = 1;
	if (data.frequency_type === FREQUENCY_TYPES.INTERVAL) {
		frequencyValue = parseInt(data.interval_days, 10);
	} else if (data.frequency_type === FREQUENCY_TYPES.WEEKLY) {
		frequencyValue = activeWeekly ? activeWeekly.length : 1;
	}

	return {
		frequencyValue,
		activeWeekly,
	};
}
