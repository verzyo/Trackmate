import { supabase } from "@/lib/supabase";
import type {
	AttachmentData,
	CreateGoalParams,
	GoalWithParticipant,
	UpdateGoalMetadataParams,
} from "@/schemas/goal.schema";
import {
	acceptInvite,
	completeGoal,
	createGoal,
	createInvite,
	declineInvite,
	deleteGoal,
	leaveGoal,
	uncompleteGoal,
	updateCompletionWithAttachment,
	updateGoalMetadata,
} from "@/services/goal.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { goalKeys } from "./useGoalQueries";

type CompletionVariables = {
	goalId: string;
	userId: string;
	attachmentData?: AttachmentData;
};

const createMutationWithInvalidation = <TVariables, TData = void>(
	mutationFn: (variables: TVariables) => Promise<TData>,
	getKeys: (variables: TVariables) => readonly (readonly unknown[])[],
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: (_, variables) => {
			for (const key of getKeys(variables)) {
				queryClient.invalidateQueries({ queryKey: key });
			}
		},
	});
};

const completionInvalidateKeys = (variables: CompletionVariables) =>
	[
		goalKeys.detail(variables.goalId),
		goalKeys.lists(),
		goalKeys.completions(variables.goalId, variables.userId),
		goalKeys.todayCompletion(variables.goalId, variables.userId),
		goalKeys.todaysCompletions(variables.userId),
		goalKeys.streak(variables.goalId, variables.userId),
		goalKeys.monthlyPoints(variables.goalId, variables.userId),
		goalKeys.todaysCompletionsForGoals(),
	] as const;

const cancelCompletionQueries = async (
	queryClient: ReturnType<typeof useQueryClient>,
	variables: CompletionVariables,
) => {
	await queryClient.cancelQueries({
		queryKey: goalKeys.todaysCompletions(variables.userId),
	});
	await queryClient.cancelQueries({
		queryKey: goalKeys.todaysCompletionsForGoals(),
	});
	await queryClient.cancelQueries({
		queryKey: goalKeys.todayCompletion(variables.goalId, variables.userId),
	});
};

const updateOptimisticCompletions = (
	queryClient: ReturnType<typeof useQueryClient>,
	variables: CompletionVariables,
	isAdding: boolean,
) => {
	const today = new Date().toISOString().split("T")[0];
	const currentMonth = new Date().toISOString().slice(0, 7);

	queryClient.setQueryData<string[]>(
		goalKeys.todaysCompletions(variables.userId),
		(old) => {
			if (isAdding) {
				return old ? [...old, variables.goalId] : [variables.goalId];
			}
			return old ? old.filter((id) => id !== variables.goalId) : [];
		},
	);

	queryClient.setQueryData<{ completed_date: string }[]>(
		goalKeys.completions(variables.goalId, variables.userId),
		(old) => {
			if (isAdding) {
				return old
					? [...old, { completed_date: today }]
					: [{ completed_date: today }];
			}
			return old ? old.filter((c) => c.completed_date !== today) : [];
		},
	);

	queryClient.setQueriesData<{ goal_id: string; user_id: string }[]>(
		{ queryKey: goalKeys.todaysCompletionsForGoals() },
		(old) => {
			if (isAdding) {
				return old
					? [
							...old,
							{
								goal_id: variables.goalId,
								user_id: variables.userId,
							},
						]
					: old;
			}
			return old
				? old.filter(
						(c) =>
							!(
								c.goal_id === variables.goalId && c.user_id === variables.userId
							),
					)
				: old;
		},
	);

	if (isAdding) {
		queryClient.setQueryData(
			goalKeys.todayCompletion(variables.goalId, variables.userId),
			{
				id: "temp-id",
				attachment_data: variables.attachmentData || null,
			},
		);
	} else {
		queryClient.setQueryData(
			goalKeys.todayCompletion(variables.goalId, variables.userId),
			null,
		);
	}

	const currentStreak =
		queryClient.getQueryData<number>(
			goalKeys.streak(variables.goalId, variables.userId),
		) ?? 0;

	const pointsDelta = isAdding
		? Math.min(1 + currentStreak, 10)
		: -Math.min(1 + (currentStreak - 1), 10);

	queryClient.setQueryData<number>(
		goalKeys.streak(variables.goalId, variables.userId),
		(old) => {
			const current = old ?? 0;
			return isAdding ? current + 1 : Math.max(0, current - 1);
		},
	);

	queryClient.setQueryData<number>(
		goalKeys.monthlyPoints(variables.goalId, variables.userId),
		(old) => (old ?? 0) + pointsDelta,
	);

	queryClient.setQueryData<any[]>(
		goalKeys.leaderboard(variables.goalId),
		(old) => {
			if (!old) return old;
			return old
				.map((entry) => {
					if (entry.user_id === variables.userId) {
						const currentPoints = Number(entry.points) || 0;
						const newPoints = Math.max(0, currentPoints + pointsDelta);
						return {
							...entry,
							points: newPoints,
							streak: isAdding
								? (Number(entry.streak) || 0) + 1
								: Math.max(0, (Number(entry.streak) || 0) - 1),
						};
					}
					return entry;
				})
				.sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0))
				.map((entry, index) => ({ ...entry, rank: index + 1 }));
		},
	);

	queryClient.setQueryData<any[]>(
		goalKeys.monthlyPointsAll(variables.goalId),
		(old) => {
			if (!old) return old;
			const monthToMatch = currentMonth;
			return old.map((entry) => {
				const isUserMatch = entry.user_id === variables.userId;
				const isMonthMatch =
					entry.month === monthToMatch ||
					(typeof entry.month === "string" &&
						entry.month.startsWith(monthToMatch));

				if (isUserMatch && isMonthMatch) {
					return {
						...entry,
						points: Math.max(0, (Number(entry.points) || 0) + pointsDelta),
					};
				}
				return entry;
			});
		},
	);
};

export const useCreateGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: CreateGoalParams & { userId: string }) =>
			createGoal(params),
		onMutate: async (newGoal) => {
			await queryClient.cancelQueries({ queryKey: goalKeys.lists() });

			const previousGoals = queryClient.getQueryData<GoalWithParticipant[]>(
				goalKeys.lists(),
			);

			const optimisticGoal: GoalWithParticipant = {
				id: `temp-id-${Math.random().toString(36).substr(2, 9)}`,
				title: newGoal.title,
				description: newGoal.description ?? null,
				owner_id: newGoal.userId,
				created_at: newGoal.start_date ?? new Date().toISOString(),
				frequency_type: newGoal.frequency_type,
				frequency_value: newGoal.frequency_value,
				start_date: newGoal.start_date,
				weekly_days: newGoal.weekly_days,
				attachment_type: newGoal.attachment_type,
				require_attachment: newGoal.require_attachment,
				goal_participants: [
					{
						goal_id: "temp-id",
						user_id: newGoal.userId,
						joined_at: new Date().toISOString(),
						icon: newGoal.icon || null,
						color: newGoal.color || null,
					},
				],
			};

			queryClient.setQueryData<GoalWithParticipant[]>(
				goalKeys.lists(),
				(old) => (old ? [optimisticGoal, ...old] : [optimisticGoal]),
			);

			return { previousGoals };
		},
		onError: (_err, _newGoal, context) => {
			if (context?.previousGoals) {
				queryClient.setQueryData(goalKeys.lists(), context.previousGoals);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
		},
	});
};

export const useUpdateGoalMetadata = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: UpdateGoalMetadataParams) =>
			updateGoalMetadata(params),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: goalKeys.detail(variables.goal_id),
			});
			queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
		},
	});
};

export const useDeleteGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteGoal(id),
		onMutate: async (goalId) => {
			await queryClient.cancelQueries({ queryKey: goalKeys.lists() });

			const previousGoals = queryClient.getQueryData<GoalWithParticipant[]>(
				goalKeys.lists(),
			);

			queryClient.setQueryData<GoalWithParticipant[]>(
				goalKeys.lists(),
				(old) => old?.filter((goal) => goal.id !== goalId) ?? [],
			);

			return { previousGoals };
		},
		onError: (_err, _goalId, context) => {
			if (context?.previousGoals) {
				queryClient.setQueryData(goalKeys.lists(), context.previousGoals);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
		},
	});
};

export const useLeaveGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (goalId: string) => leaveGoal(goalId),
		onMutate: async (goalId) => {
			await queryClient.cancelQueries({ queryKey: goalKeys.lists() });

			const previousGoals = queryClient.getQueryData<GoalWithParticipant[]>(
				goalKeys.lists(),
			);

			queryClient.setQueryData<GoalWithParticipant[]>(
				goalKeys.lists(),
				(old) => old?.filter((goal) => goal.id !== goalId) ?? [],
			);

			return { previousGoals };
		},
		onError: (_err, _goalId, context) => {
			if (context?.previousGoals) {
				queryClient.setQueryData(goalKeys.lists(), context.previousGoals);
			}
		},
		onSettled: (_, __, goalId) => {
			queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
			queryClient.invalidateQueries({ queryKey: goalKeys.detail(goalId) });
		},
	});
};

export const useCompleteGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ goalId, userId, attachmentData }: CompletionVariables) =>
			completeGoal(goalId, userId, attachmentData),
		onMutate: async (variables) => {
			await cancelCompletionQueries(queryClient, variables);

			const previousCompletions = queryClient.getQueryData<string[]>(
				goalKeys.todaysCompletions(variables.userId),
			);
			const previousGoalCompletions = queryClient.getQueryData<
				{ completed_date: string }[]
			>(goalKeys.completions(variables.goalId, variables.userId));
			const previousStreak = queryClient.getQueryData<number>(
				goalKeys.streak(variables.goalId, variables.userId),
			);
			const previousPoints = queryClient.getQueryData<number>(
				goalKeys.monthlyPoints(variables.goalId, variables.userId),
			);
			const previousLeaderboard = queryClient.getQueryData<any[]>(
				goalKeys.leaderboard(variables.goalId),
			);
			const previousMonthlyPointsAll = queryClient.getQueryData<any[]>(
				goalKeys.monthlyPointsAll(variables.goalId),
			);

			updateOptimisticCompletions(queryClient, variables, true);

			return {
				previousCompletions,
				previousGoalCompletions,
				previousStreak,
				previousPoints,
				previousLeaderboard,
				previousMonthlyPointsAll,
			};
		},
		onError: (_err, variables, context) => {
			if (context?.previousCompletions) {
				queryClient.setQueryData(
					goalKeys.todaysCompletions(variables.userId),
					context.previousCompletions,
				);
			}
			if (context?.previousGoalCompletions) {
				queryClient.setQueryData(
					goalKeys.completions(variables.goalId, variables.userId),
					context.previousGoalCompletions,
				);
			}
			if (context?.previousStreak !== undefined) {
				queryClient.setQueryData(
					goalKeys.streak(variables.goalId, variables.userId),
					context.previousStreak,
				);
			}
			if (context?.previousPoints !== undefined) {
				queryClient.setQueryData(
					goalKeys.monthlyPoints(variables.goalId, variables.userId),
					context.previousPoints,
				);
			}
			if (context?.previousLeaderboard) {
				queryClient.setQueryData(
					goalKeys.leaderboard(variables.goalId),
					context.previousLeaderboard,
				);
			}
			if (context?.previousMonthlyPointsAll) {
				queryClient.setQueryData(
					goalKeys.monthlyPointsAll(variables.goalId),
					context.previousMonthlyPointsAll,
				);
			}
		},
		onSettled: (_, __, variables) => {
			for (const key of completionInvalidateKeys(variables)) {
				queryClient.invalidateQueries({ queryKey: key });
			}
		},
	});
};

export const useUncompleteGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ goalId, userId }: CompletionVariables) =>
			uncompleteGoal(goalId, userId),
		onMutate: async (variables) => {
			await cancelCompletionQueries(queryClient, variables);

			const previousCompletions = queryClient.getQueryData<string[]>(
				goalKeys.todaysCompletions(variables.userId),
			);
			const previousGoalCompletions = queryClient.getQueryData<
				{ completed_date: string }[]
			>(goalKeys.completions(variables.goalId, variables.userId));
			const previousStreak = queryClient.getQueryData<number>(
				goalKeys.streak(variables.goalId, variables.userId),
			);
			const previousPoints = queryClient.getQueryData<number>(
				goalKeys.monthlyPoints(variables.goalId, variables.userId),
			);
			const previousLeaderboard = queryClient.getQueryData<any[]>(
				goalKeys.leaderboard(variables.goalId),
			);
			const previousMonthlyPointsAll = queryClient.getQueryData<any[]>(
				goalKeys.monthlyPointsAll(variables.goalId),
			);

			updateOptimisticCompletions(queryClient, variables, false);

			return {
				previousCompletions,
				previousGoalCompletions,
				previousStreak,
				previousPoints,
				previousLeaderboard,
				previousMonthlyPointsAll,
			};
		},
		onError: (_err, variables, context) => {
			if (context?.previousCompletions) {
				queryClient.setQueryData(
					goalKeys.todaysCompletions(variables.userId),
					context.previousCompletions,
				);
			}
			if (context?.previousGoalCompletions) {
				queryClient.setQueryData(
					goalKeys.completions(variables.goalId, variables.userId),
					context.previousGoalCompletions,
				);
			}
			if (context?.previousStreak !== undefined) {
				queryClient.setQueryData(
					goalKeys.streak(variables.goalId, variables.userId),
					context.previousStreak,
				);
			}
			if (context?.previousPoints !== undefined) {
				queryClient.setQueryData(
					goalKeys.monthlyPoints(variables.goalId, variables.userId),
					context.previousPoints,
				);
			}
			if (context?.previousLeaderboard) {
				queryClient.setQueryData(
					goalKeys.leaderboard(variables.goalId),
					context.previousLeaderboard,
				);
			}
			if (context?.previousMonthlyPointsAll) {
				queryClient.setQueryData(
					goalKeys.monthlyPointsAll(variables.goalId),
					context.previousMonthlyPointsAll,
				);
			}
		},
		onSettled: (_, __, variables) => {
			for (const key of completionInvalidateKeys(variables)) {
				queryClient.invalidateQueries({ queryKey: key });
			}
		},
	});
};

export const useUpdateCompletion = () => {
	return createMutationWithInvalidation(
		({
			goalId,
			userId,
			attachmentData,
		}: {
			goalId: string;
			userId: string;
			attachmentData: AttachmentData;
		}) => updateCompletionWithAttachment(goalId, userId, attachmentData),
		(variables) => [
			goalKeys.completions(variables.goalId, variables.userId),
			goalKeys.todayCompletion(variables.goalId, variables.userId),
		],
	);
};

export const useCreateInvite = () => {
	return createMutationWithInvalidation(
		({
			goalId,
			inviterId,
			inviteeId,
		}: {
			goalId: string;
			inviterId: string;
			inviteeId: string;
		}) => createInvite(goalId, inviterId, inviteeId),
		(variables) => [goalKeys.invites(variables.inviteeId)],
	);
};

export const useAcceptInvite = () => {
	return createMutationWithInvalidation(
		({
			inviteId,
			userId,
		}: {
			inviteId: string;
			userId: string;
			goalId: string;
		}) => acceptInvite(inviteId, userId),
		(variables) => [
			goalKeys.invites(variables.userId),
			goalKeys.lists(),
			goalKeys.detail(variables.goalId),
		],
	);
};

export const useDeclineInvite = () => {
	return createMutationWithInvalidation(
		({ inviteId, userId: _userId }: { inviteId: string; userId: string }) =>
			declineInvite(inviteId),
		(variables) => [goalKeys.invites(variables.userId)],
	);
};

export const useUpdateParticipant = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			goalId,
			userId,
			icon,
			color,
		}: {
			goalId: string;
			userId: string;
			icon?: string;
			color?: string;
		}) => {
			const { error } = await supabase.rpc("update_participant", {
				p_goal_id: goalId,
				p_user_id: userId,
				p_icon: icon,
				p_color: color,
			});
			if (error) throw error;
		},
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: goalKeys.lists() });
			await queryClient.cancelQueries({
				queryKey: goalKeys.detail(variables.goalId),
			});

			const previousGoals = queryClient.getQueryData<GoalWithParticipant[]>(
				goalKeys.lists(),
			);
			const previousGoal = queryClient.getQueryData<GoalWithParticipant>(
				goalKeys.detail(variables.goalId),
			);

			queryClient.setQueryData<GoalWithParticipant[]>(goalKeys.lists(), (old) =>
				old?.map((goal) =>
					goal.id !== variables.goalId
						? goal
						: {
								...goal,
								goal_participants: goal.goal_participants.map((participant) =>
									participant.user_id !== variables.userId
										? participant
										: {
												...participant,
												icon: variables.icon ?? null,
												color: variables.color ?? null,
											},
								),
							},
				),
			);

			queryClient.setQueryData<GoalWithParticipant>(
				goalKeys.detail(variables.goalId),
				(old) =>
					old
						? {
								...old,
								goal_participants: old.goal_participants.map((participant) =>
									participant.user_id !== variables.userId
										? participant
										: {
												...participant,
												icon: variables.icon ?? null,
												color: variables.color ?? null,
											},
								),
							}
						: old,
			);

			return { previousGoals, previousGoal };
		},
		onError: (_err, variables, context) => {
			if (context?.previousGoals) {
				queryClient.setQueryData(goalKeys.lists(), context.previousGoals);
			}
			if (context?.previousGoal) {
				queryClient.setQueryData(
					goalKeys.detail(variables.goalId),
					context.previousGoal,
				);
			}
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: goalKeys.detail(variables.goalId),
			});
			queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
		},
	});
};
