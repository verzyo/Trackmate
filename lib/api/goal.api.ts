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

export type UpdateGoalParams = {
	goal_id: string;
	title: string;
	description: string;
};

export const updateGoal = async (params: UpdateGoalParams) => {
	const { error } = await supabase.rpc("update_goal", {
		p_goal_id: params.goal_id,
		p_new_title: params.title,
		p_new_description: params.description,
	});

	if (error) throw error;
};

export const updateGoalParticipant = async (
	goalId: string,
	newAnchorDate: string | null,
	newWeeklyDays: number[] | null,
) => {
	const { error } = await supabase.rpc("update_goal_participant", {
		p_goal_id: goalId,
		p_new_anchor_date: newAnchorDate,
		p_new_weekly_days: newWeeklyDays,
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
	goal: { title: string; description: string | null };
	inviter: { username: string; avatar_url: string | null };
};

export const fetchInvites = async (userId: string) => {
	const { data, error } = await supabase
		.from("goal_invites")
		.select(
			"*, goal:goals(title, description), inviter:profiles!inviter_id(username, avatar_url)",
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
