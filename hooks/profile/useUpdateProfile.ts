import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/lib/api/profile.api";
import { queryClient } from "@/lib/queryClient";

export const useUpdateProfile = (userId: string) => {
	return useMutation({
		mutationFn: (updates: { username?: string; nickname?: string | null }) =>
			updateProfile(userId, updates),
		onSuccess: (updatedProfile) => {
			queryClient.setQueryData(["profile", userId], updatedProfile);
		},
	});
};
