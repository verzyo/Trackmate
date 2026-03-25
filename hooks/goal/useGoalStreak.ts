import { useQuery } from "@tanstack/react-query";
import { fetchGoalStreak } from "@/lib/api/goal.api";

export const useGoalStreak = (goalId: string, userId?: string) => {
	return useQuery({
		queryKey: ["goal-streak", goalId, userId],
		queryFn: () => {
			if (!userId) throw new Error("User ID is required for streak");
			return fetchGoalStreak(goalId, userId);
		},
		enabled: !!goalId && !!userId,
	});
};
