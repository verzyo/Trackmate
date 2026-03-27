import type { GoalWithParticipant } from "@/schemas/goal.schema";

export const toUTCMidnight = (date: Date): Date => {
	return new Date(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
	);
};

export const getTodayUTC = (): Date => {
	const now = new Date();
	return new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);
};

export const isTodayUTC = (date: Date): boolean => {
	const today = getTodayUTC();
	const checkDate = new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
	return today.getTime() === checkDate.getTime();
};

export const differenceInDaysUTC = (
	dateLeft: Date,
	dateRight: Date,
): number => {
	const utcLeft = Date.UTC(
		dateLeft.getUTCFullYear(),
		dateLeft.getUTCMonth(),
		dateLeft.getUTCDate(),
	);
	const utcRight = Date.UTC(
		dateRight.getUTCFullYear(),
		dateRight.getUTCMonth(),
		dateRight.getUTCDate(),
	);
	const diffMs = utcLeft - utcRight;
	return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const addDaysUTC = (date: Date, days: number): Date => {
	const result = new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
	result.setUTCDate(result.getUTCDate() + days);
	return result;
};

export const getDayOfWeekUTC = (date: Date): number => {
	const day = date.getUTCDay();
	return day === 0 ? 7 : day;
};

export const formatToISODate = (date: Date): string => {
	return date.toISOString().split("T")[0];
};

export const getNextDueDate = (
	goal: GoalWithParticipant,
	userId: string,
): Date | null => {
	const participant = goal.goal_participants.find((p) => p.user_id === userId);
	if (!participant) return null;

	const today = getTodayUTC();

	if (goal.frequency_type === "interval") {
		if (!goal.start_date) return null;
		const anchor = new Date(goal.start_date);
		const anchorUTC = new Date(
			Date.UTC(
				anchor.getUTCFullYear(),
				anchor.getUTCMonth(),
				anchor.getUTCDate(),
			),
		);
		const diff = differenceInDaysUTC(today, anchorUTC);

		if (diff < 0) return anchorUTC;

		const periods = Math.ceil(diff / goal.frequency_value);
		return addDaysUTC(anchorUTC, periods * goal.frequency_value);
	}

	if (goal.frequency_type === "weekly") {
		if (!goal.weekly_days || goal.weekly_days.length === 0) return null;
		if (!goal.start_date) return null;

		const start = new Date(goal.start_date);
		const startUTC = new Date(
			Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
		);

		const sortedDays = [...goal.weekly_days].sort((a, b) => a - b);

		const getNextFrom = (fromDate: Date): Date => {
			const fromDay = getDayOfWeekUTC(fromDate);
			const nextDay = sortedDays.find((d) => d >= fromDay);
			if (nextDay !== undefined) {
				return addDaysUTC(fromDate, nextDay - fromDay);
			}
			const firstDay = sortedDays[0];
			return addDaysUTC(fromDate, 7 - fromDay + firstDay);
		};

		const firstDue = getNextFrom(startUTC);

		if (today.getTime() < firstDue.getTime()) {
			return firstDue;
		}

		const nextDue = getNextFrom(today);
		return nextDue.getTime() < firstDue.getTime() ? firstDue : nextDue;
	}

	return null;
};
