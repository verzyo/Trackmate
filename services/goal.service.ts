import { supabase } from "@/lib/supabase";
import type {
	AttachmentData,
	AttachmentItem,
	CreateGoalParams,
	LeaderboardEntry,
	ParticipantMonthlyPoints,
	UpdateGoalMetadataParams,
} from "@/schemas/goal.schema";
import {
	AttachmentItemSchema,
	GoalInviteWithDetailsSchema,
	GoalWithParticipantSchema,
	LeaderboardEntrySchema,
	ParticipantMonthlyPointsSchema,
} from "@/schemas/goal.schema";
import { formatToISODate, getTodayUTC } from "@/utils/date.utils";

export const fetchGoals = async () => {
	const { data, error } = await supabase
		.from("goals")
		.select("*, goal_participants!inner(*)")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return GoalWithParticipantSchema.array().parse(data ?? []);
};

export const fetchGoal = async (id: string) => {
	const { data, error } = await supabase
		.from("goals")
		.select("*, goal_participants(*)")
		.eq("id", id)
		.single();

	if (error) throw error;
	return GoalWithParticipantSchema.parse(data);
};

export const createGoal = async (params: CreateGoalParams) => {
	const { data, error } = await supabase.rpc("create_goal", {
		p_title: params.title,
		p_description: params.description ?? null,
		p_frequency_type: params.frequency_type,
		p_frequency_value: params.frequency_value,
		p_weekly_days: params.weekly_days,
		p_start_date: params.start_date,
		p_attachment_type: params.attachment_type,
		p_require_attachment: params.require_attachment,
	});

	if (error) throw error;
	return data;
};

export const updateGoalMetadata = async (params: UpdateGoalMetadataParams) => {
	const { error } = await supabase.rpc("update_goal", {
		p_goal_id: params.goal_id,
		p_new_title: params.title ?? null,
		p_new_description: params.description ?? null,
		p_new_frequency_type: params.frequency_type ?? null,
		p_new_frequency_value: params.frequency_value ?? null,
		p_new_start_date: params.start_date ?? null,
		p_new_weekly_days: params.weekly_days ?? null,
		p_new_attachment_type: params.attachment_type ?? null,
		p_new_require_attachment:
			params.require_attachment === undefined
				? null
				: params.require_attachment,
	});
	if (error) throw error;
};

export const deleteGoal = async (id: string) => {
	const { error } = await supabase.rpc("delete_goal", {
		p_goal_id: id,
	});
	if (error) throw error;
};

export const leaveGoal = async (goalId: string) => {
	const { error } = await supabase.rpc("leave_goal", {
		p_goal_id: goalId,
	});

	if (error) throw error;
};

export const createInvite = async (
	goalId: string,
	inviterId: string,
	inviteeId: string,
) => {
	const { error } = await supabase.from("goal_invites").insert({
		goal_id: goalId,
		inviter_id: inviterId,
		invitee_id: inviteeId,
	});

	if (error) throw error;
};

export const fetchInvites = async (userId: string) => {
	const { data, error } = await supabase
		.from("goal_invites")
		.select(
			`*, 
			 goal:goals(title, description, frequency_type, frequency_value),
			 inviter:profiles!inviter_id(username, avatar_url)`,
		)
		.eq("invitee_id", userId);

	if (error) throw error;
	return GoalInviteWithDetailsSchema.array().parse(data ?? []);
};

export const acceptInvite = async (inviteId: string, userId: string) => {
	const { data: inviteData, error: inviteDataError } = await supabase
		.from("goal_invites")
		.select("goal_id, goal:goals(owner_id)")
		.eq("id", inviteId)
		.maybeSingle();

	if (inviteDataError) throw inviteDataError;

	const { error } = await supabase.rpc("accept_invite", {
		p_invite_id: inviteId,
	});
	if (error) throw error;

	const goalOwner = Array.isArray(inviteData?.goal)
		? inviteData.goal[0]
		: inviteData?.goal;
	const ownerId = goalOwner?.owner_id;
	const goalId = inviteData?.goal_id;

	if (!ownerId || !goalId) return;

	const { data: ownerParticipant, error: ownerParticipantError } =
		await supabase
			.from("goal_participants")
			.select("icon, color")
			.eq("goal_id", goalId)
			.eq("user_id", ownerId)
			.maybeSingle();

	if (ownerParticipantError || !ownerParticipant) return;

	const { error: updateParticipantError } = await supabase.rpc(
		"update_participant",
		{
			p_goal_id: goalId,
			p_user_id: userId,
			p_icon: ownerParticipant.icon,
			p_color: ownerParticipant.color,
		},
	);

	if (updateParticipantError) return;
};

export const declineInvite = async (inviteId: string) => {
	const { error } = await supabase
		.from("goal_invites")
		.delete()
		.eq("id", inviteId);
	if (error) throw error;
};

export const completeGoal = async (
	goalId: string,
	userId: string,
	attachmentData?: AttachmentData,
) => {
	const { error } = await supabase.from("goal_completions").insert({
		goal_id: goalId,
		user_id: userId,
		completed_at: new Date().toISOString(),
		attachment_data: attachmentData ?? null,
	});
	if (error) throw error;
};

export const updateCompletionWithAttachment = async (
	goalId: string,
	userId: string,
	attachmentData: AttachmentData,
) => {
	const { error } = await supabase.rpc("update_completion_attachment", {
		p_goal_id: goalId,
		p_user_id: userId,
		p_attachment_data: attachmentData,
	});
	if (error) throw error;
};

export const fetchTodayCompletion = async (goalId: string, userId: string) => {
	const today = formatToISODate(getTodayUTC());
	const { data, error } = await supabase
		.from("goal_completions")
		.select("id, attachment_data")
		.eq("goal_id", goalId)
		.eq("user_id", userId)
		.eq("completed_date", today)
		.maybeSingle();
	if (error) throw error;
	return data;
};

export const fetchTodaysCompletions = async (userId: string) => {
	const today = formatToISODate(getTodayUTC());
	const { data, error } = await supabase
		.from("goal_completions")
		.select("goal_id")
		.eq("user_id", userId)
		.eq("completed_date", today);

	if (error) throw error;
	return data.map((c) => c.goal_id);
};

export const fetchTodaysCompletionsForGoals = async (goalIds: string[]) => {
	if (!goalIds.length) return [];
	const today = formatToISODate(getTodayUTC());
	const { data, error } = await supabase
		.from("goal_completions")
		.select("goal_id, user_id")
		.eq("completed_date", today)
		.in("goal_id", goalIds);
	if (error) throw error;
	return data;
};

export const uncompleteGoal = async (goalId: string, userId: string) => {
	const today = formatToISODate(getTodayUTC());
	const { error } = await supabase.from("goal_completions").delete().match({
		goal_id: goalId,
		user_id: userId,
		completed_date: today,
	});

	if (error) throw error;
};

export const fetchGoalStreak = async (goalId: string, userId: string) => {
	const { data, error } = await supabase.rpc("get_goal_streak", {
		p_goal_id: goalId,
		p_user_id: userId,
	});
	if (error) throw error;
	return data as number;
};

export const fetchGoalMonthlyPoints = async (
	goalId: string,
	userId: string,
) => {
	const { data, error } = await supabase.rpc("get_goal_user_monthly_points", {
		p_goal_id: goalId,
		p_user_id: userId,
	});
	if (error) throw error;
	return data as number;
};

export const fetchGoalCompletions = async (goalId: string, userId: string) => {
	const { data, error } = await supabase
		.from("goal_completions")
		.select("*")
		.eq("goal_id", goalId)
		.eq("user_id", userId)
		.order("completed_at", { ascending: false });
	if (error) throw error;
	return data;
};

export const getSignedUrl = async (path: string) => {
	const { data, error } = await supabase.storage
		.from("attachments")
		.createSignedUrl(path, 3600);
	if (error) throw error;
	return data?.signedUrl;
};

export const fetchGoalLeaderboard = async (
	goalId: string,
): Promise<LeaderboardEntry[]> => {
	const { data, error } = await supabase.rpc("get_goal_leaderboard", {
		p_goal_id: goalId,
	});
	if (error) {
		console.error("fetchGoalLeaderboard RPC Error:", error);
		throw error;
	}
	console.log("fetchGoalLeaderboard raw data:", data);
	try {
		return LeaderboardEntrySchema.array().parse(data ?? []);
	} catch (parseError) {
		console.error("fetchGoalLeaderboard Parse Error:", parseError);
		return data as LeaderboardEntry[];
	}
};

export const fetchGoalMonthlyPointsForAll = async (
	goalId: string,
): Promise<ParticipantMonthlyPoints[]> => {
	const { data, error } = await supabase.rpc("get_goal_monthly_points_all", {
		p_goal_id: goalId,
	});
	if (error) {
		console.error("fetchGoalMonthlyPointsForAll RPC Error:", error);
		throw error;
	}
	try {
		return ParticipantMonthlyPointsSchema.array().parse(data ?? []);
	} catch (parseError) {
		console.error("fetchGoalMonthlyPointsForAll Parse Error:", parseError);
		return data as ParticipantMonthlyPoints[];
	}
};

export const fetchGoalPendingInvites = async (goalId: string) => {
	const { data, error } = await supabase
		.from("goal_invites")
		.select(
			`*, 
			 invitee:profiles!invitee_id(username, nickname, avatar_url)`,
		)
		.eq("goal_id", goalId);

	if (error) throw error;
	return data ?? [];
};

export const fetchRecentAttachments = async (
	goalId: string,
	limit = 5,
): Promise<AttachmentItem[]> => {
	// First, fetch completions with attachment data
	const { data: completionsData, error: completionsError } = await supabase
		.from("goal_completions")
		.select("id, goal_id, user_id, completed_at, attachment_data")
		.eq("goal_id", goalId)
		.not("attachment_data", "is", null)
		.order("completed_at", { ascending: false })
		.limit(limit);

	if (completionsError) {
		console.error("fetchRecentAttachments Error:", completionsError);
		throw completionsError;
	}

	if (!completionsData || completionsData.length === 0) {
		return [];
	}

	// Get unique user IDs from completions
	const userIds = [...new Set(completionsData.map((c) => c.user_id))];

	// Fetch profiles for those users
	const { data: profilesData, error: profilesError } = await supabase
		.from("profiles")
		.select("id, username, nickname, avatar_url")
		.in("id", userIds);

	if (profilesError) {
		console.error("fetchRecentAttachments Profiles Error:", profilesError);
		// Continue with empty profiles - we'll show what we can
	}

	// Create a map of user_id to profile
	const profileMap = new Map(
		(profilesData ?? []).map((p) => [
			p.id,
			{ username: p.username, nickname: p.nickname, avatar_url: p.avatar_url },
		]),
	);

	// Transform the data
	const transformed = completionsData.map((item) => {
		const profile = profileMap.get(item.user_id);
		return {
			id: item.id,
			goal_id: item.goal_id,
			user_id: item.user_id,
			completed_at: item.completed_at,
			attachment_data: item.attachment_data as {
				type: string;
				path?: string;
				url?: string;
				content?: string;
			},
			username: profile?.username ?? "Unknown",
			nickname: profile?.nickname ?? null,
			avatar_url: profile?.avatar_url ?? null,
		};
	});

	try {
		return AttachmentItemSchema.array().parse(transformed);
	} catch (parseError) {
		console.error("fetchRecentAttachments Parse Error:", parseError);
		return transformed as AttachmentItem[];
	}
};
