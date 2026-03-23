import { useQuery } from "@tanstack/react-query";
import { fetchGoal } from "@/lib/api/goal.api";

export const goalQueryKeys = {
	goal: (id: string) => ["goal", id] as const,
};

export const useGoal = (id: string) => {
	return useQuery({
		queryKey: goalQueryKeys.goal(id),
		queryFn: () => fetchGoal(id),
		enabled: !!id,
	});
};
