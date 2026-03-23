import { supabase } from "@/lib/supabase";

export type Goal = {
	id: string;
	title: string;
	description: string | null;
	owner_id: string;
	created_at: string;
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
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data as Goal[];
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
