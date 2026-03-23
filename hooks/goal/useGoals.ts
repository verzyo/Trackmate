import { useQuery } from "@tanstack/react-query";
import { fetchGoals } from "@/lib/api/goal.api";

export const queryKeys = {
	goals: ["goals"] as const,
};

export const useGoals = () => {
	return useQuery({
		queryKey: queryKeys.goals,
		queryFn: fetchGoals,
	});
};
