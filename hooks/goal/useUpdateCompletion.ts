import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	type AttachmentData,
	updateCompletionWithAttachment,
} from "@/lib/api/goal.api";

export const useUpdateCompletion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			goalId,
			userId,
			attachmentData,
		}: {
			goalId: string;
			userId: string;
			attachmentData: AttachmentData;
		}) => updateCompletionWithAttachment(goalId, userId, attachmentData),
		onSuccess: (_, { goalId, userId }) => {
			queryClient.invalidateQueries({
				queryKey: ["goal-completions", goalId, userId],
			});
			queryClient.invalidateQueries({
				queryKey: ["today-completion", goalId, userId],
			});
		},
	});
};
