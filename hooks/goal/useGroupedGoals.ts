import { useMemo } from "react";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import {
	addDaysUTC,
	differenceInDaysUTC,
	getDayOfWeekUTC,
	getTodayUTC,
	isTodayUTC,
} from "@/utils/date.utils";

export function getNextDueDate(
	goal: GoalWithParticipant,
	userId: string,
): Date | null {
	const participant = goal.goal_participants.find((p) => p.user_id === userId);
	if (!participant) return null;

	const today = getTodayUTC();

	if (goal.frequency_type === "interval") {
		if (!participant.anchor_date) return null;
		const anchor = new Date(participant.anchor_date);
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
		if (!participant.weekly_days || participant.weekly_days.length === 0)
			return null;

		const currentTargetDay = getDayOfWeekUTC(today);

		const sortedDays = [...participant.weekly_days].sort((a, b) => a - b);
		const nextDay = sortedDays.find((d) => d >= currentTargetDay);

		if (nextDay !== undefined) {
			return addDaysUTC(today, nextDay - currentTargetDay);
		}

		const firstDayNextWeek = sortedDays[0];
		return addDaysUTC(today, 7 - currentTargetDay + firstDayNextWeek);
	}

	return null;
}

export function useGroupedGoals(
	goals: GoalWithParticipant[] | undefined,
	userId: string | undefined,
	todaysCompletions: string[] | undefined,
) {
	return useMemo(() => {
		if (!goals || !userId) return { today: [], upcoming: [] };

		const today: (GoalWithParticipant & {
			nextDueDate: Date;
			isCompleted: boolean;
		})[] = [];
		const upcoming: (GoalWithParticipant & {
			nextDueDate: Date;
			daysUntil: number;
		})[] = [];

		const now = getTodayUTC();
		const completedSet = new Set(todaysCompletions || []);

		for (const goal of goals) {
			const nextDate = getNextDueDate(goal, userId);
			if (nextDate) {
				if (isTodayUTC(nextDate)) {
					today.push({
						...goal,
						nextDueDate: nextDate,
						isCompleted: completedSet.has(goal.id),
					});
				} else if (nextDate.getTime() > now.getTime()) {
					upcoming.push({
						...goal,
						nextDueDate: nextDate,
						daysUntil: differenceInDaysUTC(nextDate, now),
					});
				}
			}
		}

		today.sort((a, b) => {
			if (a.isCompleted === b.isCompleted) return 0;
			return a.isCompleted ? 1 : -1;
		});

		upcoming.sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());

		return { today, upcoming };
	}, [goals, userId, todaysCompletions]);
}
