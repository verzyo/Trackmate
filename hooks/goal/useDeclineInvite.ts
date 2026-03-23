import { useMutation, useQueryClient } from "@tanstack/react-query";
import { declineInvite } from "@/lib/api/goal.api";

export const useDeclineInvite = (userId?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (inviteId: string) => declineInvite(inviteId),
		onSuccess: () => {
			if (userId) {
				queryClient.invalidateQueries({ queryKey: ["goal_invites", userId] });
			}
		},
	});
};
