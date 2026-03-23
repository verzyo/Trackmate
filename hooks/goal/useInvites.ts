import { useQuery } from "@tanstack/react-query";
import { fetchInvites } from "@/lib/api/goal.api";

export const useInvites = (userId?: string) => {
	return useQuery({
		queryKey: ["goal_invites", userId],
		queryFn: () => {
			if (!userId) return [];
			return fetchInvites(userId);
		},
		enabled: !!userId,
	});
};
