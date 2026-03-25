import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeGoal } from "@/lib/api/goal.api";
import { queryKeys as goalKeys } from "./useGoals";
import { completionQueryKeys } from "./useTodaysCompletions";

export const useCompleteGoal = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ goalId, userId }: { goalId: string; userId: string }) =>
			completeGoal(goalId, userId),
		onSuccess: (_, { userId }) => {
			queryClient.invalidateQueries({ queryKey: goalKeys.goals });
			queryClient.invalidateQueries({
				queryKey: completionQueryKeys.todaysCompletions(userId),
			});
		},
	});
};
