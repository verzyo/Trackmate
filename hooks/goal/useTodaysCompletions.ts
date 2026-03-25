import { useQuery } from "@tanstack/react-query";
import { fetchTodaysCompletions } from "@/lib/api/goal.api";

export const completionQueryKeys = {
	todaysCompletions: (userId: string) =>
		["todays-completions", userId] as const,
};

export const useTodaysCompletions = (userId?: string) => {
	return useQuery({
		queryKey: completionQueryKeys.todaysCompletions(userId || ""),
		queryFn: () => {
			if (!userId) throw new Error("User ID is required for completions");
			return fetchTodaysCompletions(userId);
		},
		enabled: !!userId,
	});
};
