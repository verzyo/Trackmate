import { supabase } from "@/lib/supabase";

export type Goal = {
	id: string;
	title: string;
	description: string | null;
	owner_id: string;
	created_at: string;
};

export type GoalParticipant = {
	goal_id: string;
	user_id: string;
	joined_at: string;
	interval_days: number | null;
	weekly_days: number[] | null;
	anchor_date: string;
	frequency_type: "interval" | "weekly";
};

export type GoalWithParticipant = Goal & {
	goal_participants: GoalParticipant[];
};

export type CreateGoalParams = {
	title: string;
	description: string;
	frequency_type: "interval" | "weekly";
	interval_days: number | null;
	weekly_days: number[] | null;
	anchor_date: string;
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
		title: params.title,
		description: params.description,
		frequency_type: params.frequency_type,
		interval_days: params.interval_days,
		weekly_days: params.weekly_days,
		anchor_date: params.anchor_date,
	});

	if (error) throw error;
	return data;
};

export type UpdateGoalParams = CreateGoalParams & { goal_id: string };

export const updateGoal = async (params: UpdateGoalParams) => {
	const { error: goalError } = await supabase
		.from("goals")
		.update({
			title: params.title,
			description: params.description,
		})
		.eq("id", params.goal_id);

	if (goalError) throw goalError;

	const { error: participantError } = await supabase
		.from("goal_participants")
		.update({
			frequency_type: params.frequency_type,
			interval_days: params.interval_days,
			weekly_days: params.weekly_days,
			anchor_date: params.anchor_date,
		})
		.eq("goal_id", params.goal_id);

	if (participantError) throw participantError;
};

export const deleteGoal = async (id: string) => {
	const { error } = await supabase.from("goals").delete().eq("id", id);
	if (error) throw error;
};

export const leaveGoal = async (goalId: string, userId: string) => {
	const { error } = await supabase
		.from("goal_participants")
		.delete()
		.eq("goal_id", goalId)
		.eq("user_id", userId);

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
