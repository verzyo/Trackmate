import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";
import type { ProfileUpdates } from "@/schemas/profile.schema";

export const fetchProfile = async (userId: string) => {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", userId)
		.maybeSingle();

	if (error) throw error;
	return data;
};

export const fetchProfilesByIds = async (userIds: string[]) => {
	if (!userIds.length) return [];
	const { data, error } = await supabase
		.from("profiles")
		.select("id, username, nickname, avatar_url")
		.in("id", userIds);
	if (error) throw error;
	return data;
};

export const fetchProfileByUsername = async (username: string) => {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.ilike("username", username)
		.maybeSingle();

	if (error) throw error;
	return data;
};

export const updateProfile = async (
	userId: string,
	updates: ProfileUpdates,
) => {
	const { data, error } = await supabase
		.from("profiles")
		.update(updates)
		.eq("id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const uploadAvatar = async (
	userId: string,
	uri: string,
	mimeType: string,
) => {
	const path = `${userId}/avatar`;

	let fileBody: FormData | Blob;
	const options: { upsert: boolean; contentType?: string } = { upsert: true };

	if (Platform.OS === "web") {
		const response = await fetch(uri);
		fileBody = await response.blob();
		options.contentType = mimeType;
	} else {
		fileBody = new FormData();
		fileBody.append("file", {
			uri: uri,
			name: "avatar.jpg",
			type: mimeType,
		} as unknown as Blob);
	}

	const { error } = await supabase.storage
		.from("avatars")
		.upload(path, fileBody, options);

	if (error) throw error;

	const { data } = supabase.storage.from("avatars").getPublicUrl(path);
	const cleanUrl = data.publicUrl;

	try {
		await updateProfile(userId, { avatar_url: cleanUrl });
	} catch (error) {
		await supabase.storage.from("avatars").remove([path]);
		throw error;
	}

	return `${cleanUrl}?t=${Date.now()}`;
};

export const removeAvatar = async (userId: string) => {
	const { error } = await supabase.storage
		.from("avatars")
		.remove([`${userId}/avatar`]);

	if (error) throw error;
	await updateProfile(userId, { avatar_url: null });
};
