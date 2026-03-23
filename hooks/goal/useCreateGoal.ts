import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGoal, type CreateGoalParams } from "@/lib/api/goal.api";
import { queryKeys } from "./useGoals";

export const useCreateGoal = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: CreateGoalParams) => createGoal(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.goals });
		},
	});
};
