import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveGoal } from "@/lib/api/goal.api";
import { queryKeys as goalsQueryKeys } from "./useGoals";

export const useLeaveGoal = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (goalId: string) => leaveGoal(goalId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: goalsQueryKeys.goals });
		},
	});
};
