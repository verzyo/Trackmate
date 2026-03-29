import { supabase } from "@/lib/supabase";
import {
	ProfileSchema,
	type ProfileUpdates,
	type PublicProfile,
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

export const fetchAssociatedPeople = async (
	userId: string,
	excludeUserIds: string[] = [],
): Promise<PublicProfile[]> => {
	// First get all goal IDs where user is a participant
	const { data: userGoals, error: userGoalsError } = await supabase
		.from("goal_participants")
		.select("goal_id")
		.eq("user_id", userId);

	if (userGoalsError) throw userGoalsError;

	const goalIds = userGoals?.map((g) => g.goal_id) ?? [];

	let goalMates: { user_id: string }[] = [];
	if (goalIds.length > 0) {
		const { data, error } = await supabase
			.from("goal_participants")
			.select("user_id")
			.in("goal_id", goalIds)
			.neq("user_id", userId);
		if (error) throw error;
		goalMates = data ?? [];
	}

	// Get all people the user has invited
	const { data: invited, error: invitedError } = await supabase
		.from("goal_invites")
		.select("invitee_id")
		.eq("inviter_id", userId);

	if (invitedError) throw invitedError;

	// Get all people who have invited the user
	const { data: inviters, error: invitersError } = await supabase
		.from("goal_invites")
		.select("inviter_id")
		.eq("invitee_id", userId);

	if (invitersError) throw invitersError;

	// Collect all unique user IDs
	const allUserIds = [
		...goalMates.map((g) => g.user_id),
		...(invited?.map((i) => i.invitee_id) ?? []),
		...(inviters?.map((i) => i.inviter_id) ?? []),
	];
	const uniqueUserIds = [...new Set(allUserIds)].filter(
		(id) => !excludeUserIds.includes(id),
	);

	if (uniqueUserIds.length === 0) return [];

	// Fetch profiles for these users
	const { data: profiles, error: profilesError } = await supabase
		.from("profiles")
		.select("id, username, nickname, avatar_url")
		.in("id", uniqueUserIds);

	if (profilesError) throw profilesError;

	return PublicProfileSchema.array().parse(profiles ?? []);
};
