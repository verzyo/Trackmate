import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGoal } from "@/lib/api/goal.api";
import { queryKeys as goalsQueryKeys } from "./useGoals";

export const useDeleteGoal = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteGoal(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: goalsQueryKeys.goals,
			});
		},
	});
};
