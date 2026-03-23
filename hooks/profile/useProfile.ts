import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { fetchProfile } from "@/lib/api/profile.api";

export const useProfile = (userId: string) => {
	return useQuery({
		queryKey: ["profile", userId],
		queryFn: async () => {
			const profile = await fetchProfile(userId);
			if (profile?.avatar_url) {
				Image.prefetch(profile.avatar_url);
			}
			return profile;
		},
		enabled: !!userId,
	});
};
