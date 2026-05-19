import { useMemo } from "react";
import {
	useGoals,
	useInvites,
	useTodaysCompletions,
	useTodaysCompletionsForGoals,
} from "@/hooks/goal/useGoalQueries";
import { useGroupedGoals } from "@/hooks/goal/useGroupedGoals";
import { useProfile, useProfilesByIds } from "@/hooks/profile/useProfileHooks";

export function useHomeData(userId: string | undefined) {
	const { data: goals, isLoading: isGoalsLoading, error } = useGoals();
	const { data: todaysCompletions, isLoading: isCompletionsLoading } =
		useTodaysCompletions(userId);
	const { data: profile } = useProfile(userId);
	const { data: invites } = useInvites(userId);

	const goalIds = useMemo(() => goals?.map((g) => g.id) || [], [goals]);
	const { data: completionsForGoals } = useTodaysCompletionsForGoals(goalIds);

	const groupedGoals = useGroupedGoals(goals, userId, todaysCompletions);

	const participantIds = useMemo(() => {
		if (!goals) return [];
		const ids = new Set<string>();
		for (const g of goals) {
			for (const p of g.goal_participants) ids.add(p.user_id);
		}
		return Array.from(ids).sort();
	}, [goals]);

	const { data: profiles } = useProfilesByIds(participantIds);

	const p = profile as
		| { nickname?: string; username?: string; avatar_url?: string }
		| null
		| undefined;
	const profileName = p?.nickname || p?.username || "?";
	const avatarUrl = p?.avatar_url || undefined;

	const profileMap = useMemo(() => {
		const map = new Map<
			string,
			{ username: string; nickname?: string | null; avatar_url?: string | null }
		>();
		if (profiles) {
			for (const p of profiles) {
				map.set(p.id, {
					username: p.username,
					nickname: p.nickname,
					avatar_url: p.avatar_url,
				});
			}
		}
		return map;
	}, [profiles]);

	const completionsMap = useMemo(() => {
		const map = new Map<string, Set<string>>();
		if (completionsForGoals) {
			for (const comp of completionsForGoals) {
				if (!map.has(comp.goal_id)) map.set(comp.goal_id, new Set());
				map.get(comp.goal_id)?.add(comp.user_id);
			}
		}
		return map;
	}, [completionsForGoals]);

	const participantAvatars = useMemo(() => {
		if (!goals) return {};
		const result: Record<
			string,
			Array<{
				user_id: string;
				name: string;
				imageUrl?: string;
				completed: boolean;
			}>
		> = {};
		for (const goal of goals) {
			result[goal.id] = goal.goal_participants.map((p) => {
				const pr = profileMap.get(p.user_id);
				const name = pr?.nickname || pr?.username || "?";
				const imageUrl = pr?.avatar_url ?? undefined;
				const completed = completionsMap.get(goal.id)?.has(p.user_id) || false;
				return { user_id: p.user_id, name, imageUrl, completed };
			});
		}
		return result;
	}, [goals, profileMap, completionsMap]);

	return {
		goals,
		groupedGoals,
		profile,
		profileName,
		avatarUrl,
		invites,
		participantAvatars,
		isLoading: isGoalsLoading || isCompletionsLoading,
		error,
	};
}
