import { useQuery } from "@tanstack/react-query";
import { fetchGoalCompletions } from "@/lib/api/goal.api";

export const useGoalCompletions = (goalId: string, userId?: string) => {
	return useQuery({
		queryKey: ["goal-completions", goalId, userId],
		queryFn: () => {
			if (!userId) throw new Error("User ID is required");
			return fetchGoalCompletions(goalId, userId);
		},
		enabled: !!goalId && !!userId,
	});
};
