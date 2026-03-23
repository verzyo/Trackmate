import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptInvite } from "@/lib/api/goal.api";
import { queryKeys as goalsQueryKeys } from "./useGoals";

export const useAcceptInvite = (userId?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (inviteId: string) => acceptInvite(inviteId),
		onSuccess: () => {
			if (userId) {
				queryClient.invalidateQueries({ queryKey: ["goal_invites", userId] });
			}
			queryClient.invalidateQueries({ queryKey: goalsQueryKeys.goals });
		},
	});
};
