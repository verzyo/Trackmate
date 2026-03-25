import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uncompleteGoal } from "@/lib/api/goal.api";
import { queryKeys as goalKeys } from "./useGoals";
import { completionQueryKeys } from "./useTodaysCompletions";

export const useUncompleteGoal = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ goalId, userId }: { goalId: string; userId: string }) =>
			uncompleteGoal(goalId, userId),
		onSuccess: (_, { userId }) => {
			queryClient.invalidateQueries({ queryKey: goalKeys.goals });
			queryClient.invalidateQueries({
				queryKey: completionQueryKeys.todaysCompletions(userId),
			});
		},
	});
};
