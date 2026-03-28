import { supabase } from "@/lib/supabase";
import {
	ProfileSchema,
	type ProfileUpdates,
	PublicProfileSchema,
} from "@/schemas/profile.schema";
import { uploadFile } from "@/utils/upload";

export const fetchProfile = async (userId: string) => {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", userId)
		.maybeSingle();

	if (error) throw error;
	return data ? ProfileSchema.parse(data) : data;
};

export const fetchProfilesByIds = async (userIds: string[]) => {
	if (!userIds.length) return [];
	const { data, error } = await supabase
		.from("profiles")
		.select("id, username, nickname, avatar_url")
		.in("id", userIds);
	if (error) throw error;
	return PublicProfileSchema.array().parse(data ?? []);
};

export const fetchProfileByUsername = async (username: string) => {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.ilike("username", username)
		.maybeSingle();

	if (error) throw error;
	return data ? ProfileSchema.parse(data) : data;
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
	return ProfileSchema.parse(data);
};

export const uploadAvatar = async (
	userId: string,
	uri: string,
	mimeType: string,
) => {
	const path = `${userId}/avatar`;
	await uploadFile("avatars", path, uri, mimeType, "avatar.jpg");

	const { data } = supabase.storage.from("avatars").getPublicUrl(path);
	const cleanUrl = data.publicUrl;
	const versionedUrl = `${cleanUrl}?t=${Date.now()}`;

	try {
		await updateProfile(userId, { avatar_url: versionedUrl });
	} catch (error) {
		await supabase.storage.from("avatars").remove([path]);
		throw error;
	}

	return versionedUrl;
};

export const removeAvatar = async (userId: string) => {
	const { error } = await supabase.storage
		.from("avatars")
		.remove([`${userId}/avatar`]);

	if (error) throw error;
	await updateProfile(userId, { avatar_url: null });
};

export const deleteMyAccount = async () => {
	const { error } = await supabase.rpc("delete_my_account");
	if (error) throw error;
};
