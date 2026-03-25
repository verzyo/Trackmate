import { useMutation, useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { queryClient } from "@/lib/queryClient";
import { fetchProfile, updateProfile } from "@/services/profile.service";

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

export const useUpdateProfile = (userId: string) => {
	return useMutation({
		mutationFn: (updates: { username?: string; nickname?: string | null }) =>
			updateProfile(userId, updates),
		onSuccess: (updatedProfile) => {
			queryClient.setQueryData(["profile", userId], updatedProfile);
		},
	});
};
