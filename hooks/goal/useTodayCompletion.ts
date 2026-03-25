import { useQuery } from "@tanstack/react-query";
import { fetchTodayCompletion } from "@/lib/api/goal.api";

export const useTodayCompletion = (goalId: string, userId?: string) => {
	return useQuery({
		queryKey: ["today-completion", goalId, userId],
		queryFn: () => {
			if (!userId) throw new Error("User ID is required");
			return fetchTodayCompletion(goalId, userId);
		},
		enabled: !!goalId && !!userId,
	});
};
