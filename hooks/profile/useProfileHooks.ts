import { useMutation, useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { queryClient } from "@/lib/queryClient";
import {
	deleteMyAccount,
	fetchProfile,
	fetchProfilesByIds,
	updateProfile,
} from "@/services/profile.service";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const pickAvatar = async () => {
	const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
	if (status !== "granted") {
		throw new Error(
			"Sorry, we need camera roll permissions to make this work!",
		);
	}

	const result = await ImagePicker.launchImageLibraryAsync({
		mediaTypes: ["images"],
		allowsEditing: true,
		aspect: [1, 1],
		quality: 0.8,
	});

	if (result.canceled) return null;

	const asset = result.assets[0];
	if (asset.fileSize && asset.fileSize > MAX_SIZE)
		throw new Error("Image must be under 5MB");
	if (asset.mimeType && !ALLOWED_TYPES.includes(asset.mimeType))
		throw new Error("Invalid file type");

	return asset;
};

export const useProfile = (userId?: string | null) => {
	return useQuery({
		queryKey: ["profile", userId],
		queryFn: async () => {
			if (!userId) return null;
			const profile = await fetchProfile(userId);
			return profile;
		},
		enabled: !!userId,
	});
};

export const useProfilesByIds = (userIds: string[]) => {
	const normalizedUserIds = Array.from(new Set(userIds)).sort();

	return useQuery({
		queryKey: ["profiles", "byIds", ...normalizedUserIds],
		queryFn: () => fetchProfilesByIds(normalizedUserIds),
		enabled: normalizedUserIds.length > 0,
	});
};

export const useUpdateProfile = (userId: string) => {
	return useMutation({
		mutationFn: (updates: { username?: string; nickname?: string | null }) =>
			updateProfile(userId, updates),
		onSuccess: (updatedProfile) => {
			queryClient.setQueryData(["profile", userId], updatedProfile);
			queryClient.setQueriesData<
				Array<{
					id: string;
					username: string;
					nickname?: string | null;
					avatar_url?: string | null;
				}>
			>({ queryKey: ["profiles", "byIds"] }, (old) =>
				old?.map((profile) =>
					profile.id === userId
						? {
								...profile,
								username: updatedProfile.username,
								nickname: updatedProfile.nickname,
								avatar_url: updatedProfile.avatar_url,
							}
						: profile,
				),
			);
		},
	});
};

export const useDeleteMyAccount = () => {
	return useMutation({
		mutationFn: deleteMyAccount,
	});
};
