import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	type UpdateParticipantSettingsParams,
	updateParticipantSettings,
} from "@/lib/api/goal.api";
import { goalQueryKeys } from "./useGoal";
import { queryKeys as goalsQueryKeys } from "./useGoals";

export const useUpdateParticipantSettings = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: UpdateParticipantSettingsParams) =>
			updateParticipantSettings(params),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: goalQueryKeys.goal(variables.goal_id),
			});
			queryClient.invalidateQueries({
				queryKey: goalsQueryKeys.goals,
			});
		},
	});
};
