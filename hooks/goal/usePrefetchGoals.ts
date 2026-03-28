import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import {
	fetchGoal,
	fetchGoalCompletions,
	fetchGoalMonthlyPoints,
	fetchGoalStreak,
	fetchTodayCompletion,
} from "@/services/goal.service";
import { goalKeys } from "./useGoalQueries";

export function usePrefetchGoals(
	goals: GoalWithParticipant[] | undefined,
	userId: string | undefined,
) {
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!goals?.length || !userId) return;

		for (const goal of goals) {
			queryClient.prefetchQuery({
				queryKey: goalKeys.detail(goal.id),
				queryFn: () => fetchGoal(goal.id),
			});
			queryClient.prefetchQuery({
				queryKey: goalKeys.todayCompletion(goal.id, userId),
				queryFn: () => fetchTodayCompletion(goal.id, userId),
			});
			queryClient.prefetchQuery({
				queryKey: goalKeys.streak(goal.id, userId),
				queryFn: () => fetchGoalStreak(goal.id, userId),
			});
			queryClient.prefetchQuery({
				queryKey: goalKeys.monthlyPoints(goal.id, userId),
				queryFn: () => fetchGoalMonthlyPoints(goal.id, userId),
			});
			queryClient.prefetchQuery({
				queryKey: goalKeys.completions(goal.id, userId),
				queryFn: () => fetchGoalCompletions(goal.id, userId),
			});
		}
	}, [goals, queryClient, userId]);
}
