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
		.select("*, goal_participants(*)")
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
