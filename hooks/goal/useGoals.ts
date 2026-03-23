import { useQuery } from "@tanstack/react-query";
import { fetchGoals } from "@/lib/api/goal.api";
import { queryClient } from "@/lib/queryClient";
import { goalQueryKeys } from "./useGoal";

export const queryKeys = {
	goals: ["goals"] as const,
};

export const useGoals = () => {
	return useQuery({
		queryKey: queryKeys.goals,
		queryFn: async () => {
			const goals = await fetchGoals();
			for (const goal of goals) {
				queryClient.setQueryData(goalQueryKeys.goal(goal.id), goal);
			}
			return goals;
		},
	});
};
