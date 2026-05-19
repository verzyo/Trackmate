import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { goalKeys } from "@/hooks/goal/useGoalQueries";
import {
	fetchGoalStreak,
	fetchGoals,
	fetchInvites,
	fetchTodaysCompletions,
	fetchTodaysCompletionsForGoals,
} from "@/services/goal.service";
import { fetchProfile, fetchProfilesByIds } from "@/services/profile.service";

export function useLoadHomeScreen(userId: string | undefined) {
	const queryClient = useQueryClient();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!userId) {
			setIsLoading(false);
			return;
		}

		async function preload() {
			try {
				setIsLoading(true);

				const [_, goals] = await Promise.all([
					queryClient.fetchQuery({
						queryKey: ["profile", userId],
						queryFn: () => fetchProfile(userId!),
					}),
					queryClient.fetchQuery({
						queryKey: goalKeys.lists(),
						queryFn: fetchGoals,
					}),
				]);

				const goalIds = goals.map((g) => g.id);
				const participantIds = Array.from(
					new Set(
						goals.flatMap((g) => g.goal_participants.map((p) => p.user_id)),
					),
				).sort();

				const [profiles] = await Promise.all([
					fetchProfilesByIds(participantIds),
					queryClient.fetchQuery({
						queryKey: goalKeys.todaysCompletions(userId!),
						queryFn: () => fetchTodaysCompletions(userId!),
					}),
					queryClient.fetchQuery({
						queryKey: [...goalKeys.todaysCompletionsForGoals(), ...goalIds],
						queryFn: () => fetchTodaysCompletionsForGoals(goalIds),
					}),
					queryClient.fetchQuery({
						queryKey: goalKeys.invites(userId!),
						queryFn: () => fetchInvites(userId!),
					}),
					...goalIds.map((goalId) =>
						queryClient.fetchQuery({
							queryKey: goalKeys.streak(goalId, userId!),
							queryFn: () => fetchGoalStreak(goalId, userId!),
						}),
					),
				]);

				profiles.forEach((profile) => {
					queryClient.setQueryData(["profile", profile.id], profile);
				});

				setIsLoading(false);
			} catch (e) {
				setError(e as Error);
				setIsLoading(false);
			}
		}

		preload();
	}, [userId, queryClient]);

	return { isLoading, error };
}
