import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AttachmentData, completeGoal } from "@/lib/api/goal.api";
import { queryKeys as goalKeys } from "./useGoals";
import { completionQueryKeys } from "./useTodaysCompletions";

export const useCompleteGoal = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			goalId,
			userId,
			attachmentData,
		}: {
			goalId: string;
			userId: string;
			attachmentData?: AttachmentData;
		}) => completeGoal(goalId, userId, attachmentData),
		onSuccess: (_, { userId }) => {
			queryClient.invalidateQueries({ queryKey: goalKeys.goals });
			queryClient.invalidateQueries({
				queryKey: completionQueryKeys.todaysCompletions(userId),
			});
		},
	});
};
