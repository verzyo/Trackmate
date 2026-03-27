import { useQuery } from "@tanstack/react-query";
import {
	fetchGoal,
	fetchGoalCompletions,
	fetchGoalMonthlyPoints,
	fetchGoalStreak,
	fetchGoals,
	fetchInvites,
	fetchTodayCompletion,
	fetchTodaysCompletions,
	fetchTodaysCompletionsForGoals,
} from "@/services/goal.service";

export const goalKeys = {
	all: ["goals"] as const,
	lists: () => [...goalKeys.all, "list"] as const,
	details: () => [...goalKeys.all, "detail"] as const,
	detail: (id: string) => [...goalKeys.details(), id] as const,
	completions: (goalId: string, userId: string) =>
		[...goalKeys.detail(goalId), "completions", userId] as const,
	todayCompletion: (goalId: string, userId: string) =>
		[...goalKeys.detail(goalId), "todayCompletion", userId] as const,
	todaysCompletions: (userId: string) =>
		[...goalKeys.all, "todaysCompletions", userId] as const,
	streak: (goalId: string, userId: string) =>
		[...goalKeys.detail(goalId), "streak", userId] as const,
	monthlyPoints: (goalId: string, userId: string) =>
		[...goalKeys.detail(goalId), "monthlyPoints", userId] as const,
	invites: (userId: string) => [...goalKeys.all, "invites", userId] as const,
};

export const useGoals = () => {
	return useQuery({
		queryKey: goalKeys.lists(),
		queryFn: fetchGoals,
	});
};

export const useGoal = (id: string) => {
	return useQuery({
		queryKey: goalKeys.detail(id),
		queryFn: () => fetchGoal(id),
		enabled: !!id,
	});
};

export const useGoalCompletions = (
	goalId: string,
	userId: string | undefined,
) => {
	return useQuery({
		queryKey: goalKeys.completions(goalId, userId ?? ""),
		queryFn: () => fetchGoalCompletions(goalId, userId as string),
		enabled: !!goalId && !!userId,
	});
};

export const useTodayCompletion = (
	goalId: string,
	userId: string | undefined,
) => {
	return useQuery({
		queryKey: goalKeys.todayCompletion(goalId, userId ?? ""),
		queryFn: () => fetchTodayCompletion(goalId, userId as string),
		enabled: !!goalId && !!userId,
	});
};

export const useTodaysCompletions = (userId: string | undefined) => {
	return useQuery({
		queryKey: goalKeys.todaysCompletions(userId ?? ""),
		queryFn: () => fetchTodaysCompletions(userId as string),
		enabled: !!userId,
	});
};

export const useTodaysCompletionsForGoals = (goalIds: string[]) => {
	return useQuery({
		queryKey: [...goalKeys.all, "todaysCompletionsForGoals", ...goalIds],
		queryFn: () => fetchTodaysCompletionsForGoals(goalIds),
		enabled: goalIds.length > 0,
	});
};

export const useGoalStreak = (goalId: string, userId: string | undefined) => {
	return useQuery({
		queryKey: goalKeys.streak(goalId, userId ?? ""),
		queryFn: () => fetchGoalStreak(goalId, userId as string),
		enabled: !!goalId && !!userId,
	});
};

export const useGoalMonthlyPoints = (
	goalId: string,
	userId: string | undefined,
) => {
	return useQuery({
		queryKey: goalKeys.monthlyPoints(goalId, userId ?? ""),
		queryFn: () => fetchGoalMonthlyPoints(goalId, userId as string),
		enabled: !!goalId && !!userId,
	});
};

export const useInvites = (userId: string | undefined) => {
	return useQuery({
		queryKey: goalKeys.invites(userId ?? ""),
		queryFn: () => fetchInvites(userId as string),
		enabled: !!userId,
	});
};
