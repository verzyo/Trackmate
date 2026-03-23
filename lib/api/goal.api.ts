import { supabase } from "@/lib/supabase";

export type Goal = {
	id: string;
	title: string;
	description: string | null;
	owner_id: string;
	created_at: string;
};


export const fetchGoals = async () => {
	const { data, error } = await supabase
		.from("goals")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data as Goal[];
};
