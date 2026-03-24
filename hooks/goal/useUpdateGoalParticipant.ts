import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGoalParticipant } from "@/lib/api/goal.api";
import { goalQueryKeys } from "./useGoal";
import { queryKeys as goalsQueryKeys } from "./useGoals";

export const useUpdateGoalParticipant = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			goalId,
			newAnchorDate,
			newWeeklyDays,
		}: {
			goalId: string;
			newAnchorDate: string | null;
			newWeeklyDays: number[] | null;
		}) => updateGoalParticipant(goalId, newAnchorDate, newWeeklyDays),
		onSuccess: (_, { goalId }) => {
			queryClient.invalidateQueries({ queryKey: goalQueryKeys.goal(goalId) });
			queryClient.invalidateQueries({ queryKey: goalsQueryKeys.goals });
		},
	});
};
