import { supabase } from "@/lib/supabase";

type ProfileUpdates = {
	username?: string;
	nickname?: string | null;
	avatar_url?: string | null;
};

export const fetchProfile = async (userId: string) => {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", userId)
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

	const response = await fetch(uri);
	const blob = await response.blob();

	const { error } = await supabase.storage
		.from("avatars")
		.upload(path, blob, { contentType: mimeType, upsert: true });

	if (error) throw error;

	const { data } = supabase.storage.from("avatars").getPublicUrl(path);
	const urlWithBuster = `${data.publicUrl}?t=${Date.now()}`;

	await updateProfile(userId, { avatar_url: urlWithBuster });
	return urlWithBuster;
};

export const removeAvatar = async (userId: string) => {
	const { error } = await supabase.storage
		.from("avatars")
		.remove([`${userId}/avatar`]);

	if (error) throw error;
	await updateProfile(userId, { avatar_url: null });
};
