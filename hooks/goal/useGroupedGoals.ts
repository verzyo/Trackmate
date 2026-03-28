import { useMemo } from "react";
import { useToday } from "@/hooks/common/useToday";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import {
	differenceInDaysUTC,
	getNextDueDate,
	isTodayUTC,
} from "@/utils/date.utils";

/**
 * Hook to group goals into "today" and "upcoming" categories.
 *
 * @param goals - The list of goals with participant details.
 * @param userId - The current user's ID.
 * @param todaysCompletions - List of goal IDs completed by the user today.
 * @returns An object containing two arrays: `today` and `upcoming`.
 *
 * Goals in `today` are those that have a due date today according to the user's timezone.
 * Goals in `upcoming` are those due in the future.
 */
export function useGroupedGoals(
	goals: GoalWithParticipant[] | undefined,
	userId: string | undefined,
	todaysCompletions: string[] | undefined,
) {
	const todayDate = useToday();

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
				} else if (nextDate.getTime() > todayDate.getTime()) {
					upcoming.push({
						...goal,
						nextDueDate: nextDate,
						daysUntil: differenceInDaysUTC(nextDate, todayDate),
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
	}, [goals, userId, todaysCompletions, todayDate]);
}
