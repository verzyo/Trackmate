import { formatToISODate, getTodayUTC } from "@/lib/date.utils";
import { supabase } from "@/lib/supabase";

export type Goal = {
	id: string;
	title: string;
	description: string | null;
	owner_id: string;
	created_at: string;
	frequency_type: "interval" | "weekly";
	frequency_value: number;
};

export type GoalParticipant = {
	goal_id: string;
	user_id: string;
	joined_at: string;
	weekly_days: number[] | null;
	anchor_date: string | null;
};

export type GoalWithParticipant = Goal & {
	goal_participants: GoalParticipant[];
};

export type CreateGoalParams = {
	title: string;
	description: string;
	frequency_type: "interval" | "weekly";
	frequency_value: number;
	weekly_days: number[] | null;
	anchor_date: string | null;
};

export const fetchGoals = async () => {
	const { data, error } = await supabase
		.from("goals")
		.select("*, goal_participants!inner(*)")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data as GoalWithParticipant[];
};

export const fetchGoal = async (id: string) => {
	const { data, error } = await supabase
		.from("goals")
		.select("*, goal_participants(*)")
		.eq("id", id)
		.single();

	if (error) throw error;
	return data as GoalWithParticipant;
};

export const createGoal = async (params: CreateGoalParams) => {
	const { data, error } = await supabase.rpc("create_goal", {
		p_title: params.title,
		p_description: params.description,
		p_frequency_type: params.frequency_type,
		p_frequency_value: params.frequency_value,
		p_weekly_days: params.weekly_days,
		p_anchor_date: params.anchor_date,
	});

	if (error) throw error;
	return data;
};

export type UpdateGoalMetadataParams = {
	goal_id: string;
	title?: string;
	description?: string;
};

export const updateGoalMetadata = async (params: UpdateGoalMetadataParams) => {
	const { error } = await supabase.rpc("update_goal", {
		p_goal_id: params.goal_id,
		p_title: params.title ?? null,
		p_description: params.description ?? null,
	});
	if (error) throw error;
};

export type UpdateParticipantSettingsParams = {
	goal_id: string;
	anchor_date?: string | null;
	weekly_days?: number[] | null;
};

export const updateParticipantSettings = async (
	params: UpdateParticipantSettingsParams,
) => {
	const { error } = await supabase.rpc("update_goal_participant", {
		p_goal_id: params.goal_id,
		p_new_anchor_date: params.anchor_date ?? null,
		p_new_weekly_days: params.weekly_days ?? null,
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

export type GoalInviteWithDetails = {
	id: string;
	goal_id: string;
	inviter_id: string;
	invitee_id: string;
	created_at: string;
	goal: {
		title: string;
		description: string | null;
		frequency_type: "interval" | "weekly";
		frequency_value: number;
	};
	inviter: { username: string; avatar_url: string | null };
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
	return data as unknown as GoalInviteWithDetails[];
};

export const acceptInvite = async (inviteId: string) => {
	const { error } = await supabase.rpc("accept_invite", {
		p_invite_id: inviteId,
	});
	if (error) throw error;
};

export const declineInvite = async (inviteId: string) => {
	const { error } = await supabase
		.from("goal_invites")
		.delete()
		.eq("id", inviteId);
	if (error) throw error;
};

export const completeGoal = async (goalId: string, userId: string) => {
	const { error } = await supabase.from("goal_completions").insert({
		goal_id: goalId,
		user_id: userId,
		completed_at: new Date().toISOString(),
	});
	if (error) throw error;
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

export const uncompleteGoal = async (goalId: string, userId: string) => {
	const today = formatToISODate(getTodayUTC());
	const { error } = await supabase.from("goal_completions").delete().match({
		goal_id: goalId,
		user_id: userId,
		completed_date: today,
	});

	if (error) throw error;
};
