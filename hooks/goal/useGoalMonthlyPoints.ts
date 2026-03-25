import { useQuery } from "@tanstack/react-query";
import { fetchGoalMonthlyPoints } from "@/lib/api/goal.api";

export const useGoalMonthlyPoints = (goalId: string, userId?: string) => {
	return useQuery({
		queryKey: ["goal-monthly-points", goalId, userId],
		queryFn: () => {
			if (!userId) throw new Error("User ID is required for points");
			return fetchGoalMonthlyPoints(goalId, userId);
		},
		enabled: !!goalId && !!userId,
	});
};
