import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInvite } from "@/lib/api/goal.api";

export const useCreateInvite = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			goalId,
			inviterId,
			inviteeId,
		}: {
			goalId: string;
			inviterId: string;
			inviteeId: string;
		}) => createInvite(goalId, inviterId, inviteeId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["goal_invites", variables.inviteeId],
			});
		},
	});
};
