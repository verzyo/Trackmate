import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { fetchProfile } from "@/lib/api/profile.api";

export const useProfile = (userId?: string | null) => {
	return useQuery({
		queryKey: ["profile", userId],
		queryFn: async () => {
			if (!userId) return null;
			const profile = await fetchProfile(userId);

			if (profile?.avatar_url) {
				const buster = profile.updated_at
					? new Date(profile.updated_at).getTime()
					: Date.now();
				Image.prefetch(`${profile.avatar_url}?t=${buster}`);
			}
			return profile;
		},
		enabled: !!userId,
	});
};
