import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveGoal } from "@/lib/api/goal.api";
import { queryKeys as goalsQueryKeys } from "./useGoals";

export const useLeaveGoal = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ goalId, userId }: { goalId: string; userId: string }) =>
			leaveGoal(goalId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: goalsQueryKeys.goals });
		},
	});
};
