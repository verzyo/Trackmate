import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
	AttachmentData,
	CreateGoalParams,
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
import { goalKeys } from "./useGoalQueries";

export const useCreateGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: CreateGoalParams) => createGoal(params),
		onSuccess: () => {
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
		},
	});
};

export const useLeaveGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (goalId: string) => leaveGoal(goalId),
		onSuccess: (_, goalId) => {
			queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
			queryClient.invalidateQueries({ queryKey: goalKeys.detail(goalId) });
		},
	});
};

export const useCompleteGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			goalId,
			userId,
			attachmentData,
		}: {
			goalId: string;
			userId: string;
			attachmentData?: AttachmentData;
		}) => completeGoal(goalId, userId, attachmentData),
		onMutate: async (newCompletion) => {
			await queryClient.cancelQueries({
				queryKey: goalKeys.todaysCompletions(newCompletion.userId),
			});
			await queryClient.cancelQueries({
				queryKey: goalKeys.todaysCompletionsForGoals(),
			});
			await queryClient.cancelQueries({
				queryKey: goalKeys.todayCompletion(
					newCompletion.goalId,
					newCompletion.userId,
				),
			});

			const previousCompletions = queryClient.getQueryData<string[]>(
				goalKeys.todaysCompletions(newCompletion.userId),
			);

			queryClient.setQueryData<string[]>(
				goalKeys.todaysCompletions(newCompletion.userId),
				(old) =>
					old ? [...old, newCompletion.goalId] : [newCompletion.goalId],
			);

			queryClient.setQueriesData<{ goal_id: string; user_id: string }[]>(
				{ queryKey: goalKeys.todaysCompletionsForGoals() },
				(old) =>
					old
						? [
								...old,
								{
									goal_id: newCompletion.goalId,
									user_id: newCompletion.userId,
								},
							]
						: old,
			);

			queryClient.setQueryData(
				goalKeys.todayCompletion(newCompletion.goalId, newCompletion.userId),
				{
					id: "temp-id",
					attachment_data: newCompletion.attachmentData || null,
				},
			);

			return { previousCompletions };
		},
		onError: (_err, newCompletion, context) => {
			if (context?.previousCompletions) {
				queryClient.setQueryData(
					goalKeys.todaysCompletions(newCompletion.userId),
					context.previousCompletions,
				);
			}
		},
		onSettled: (_, __, variables) => {
			queryClient.invalidateQueries({
				queryKey: goalKeys.detail(variables.goalId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.completions(variables.goalId, variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.todayCompletion(variables.goalId, variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.todaysCompletions(variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.streak(variables.goalId, variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.monthlyPoints(variables.goalId, variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.todaysCompletionsForGoals(),
			});
		},
	});
};

export const useUncompleteGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ goalId, userId }: { goalId: string; userId: string }) =>
			uncompleteGoal(goalId, userId),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({
				queryKey: goalKeys.todaysCompletions(variables.userId),
			});
			await queryClient.cancelQueries({
				queryKey: goalKeys.todaysCompletionsForGoals(),
			});
			await queryClient.cancelQueries({
				queryKey: goalKeys.todayCompletion(variables.goalId, variables.userId),
			});

			const previousCompletions = queryClient.getQueryData<string[]>(
				goalKeys.todaysCompletions(variables.userId),
			);

			queryClient.setQueryData<string[]>(
				goalKeys.todaysCompletions(variables.userId),
				(old) => (old ? old.filter((id) => id !== variables.goalId) : []),
			);

			queryClient.setQueriesData<{ goal_id: string; user_id: string }[]>(
				{ queryKey: goalKeys.todaysCompletionsForGoals() },
				(old) =>
					old
						? old.filter(
								(c) =>
									!(
										c.goal_id === variables.goalId &&
										c.user_id === variables.userId
									),
							)
						: old,
			);

			queryClient.setQueryData(
				goalKeys.todayCompletion(variables.goalId, variables.userId),
				null,
			);

			return { previousCompletions };
		},
		onError: (_err, variables, context) => {
			if (context?.previousCompletions) {
				queryClient.setQueryData(
					goalKeys.todaysCompletions(variables.userId),
					context.previousCompletions,
				);
			}
		},
		onSettled: (_, __, variables) => {
			queryClient.invalidateQueries({
				queryKey: goalKeys.detail(variables.goalId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.completions(variables.goalId, variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.todayCompletion(variables.goalId, variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.todaysCompletions(variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.streak(variables.goalId, variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.monthlyPoints(variables.goalId, variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.todaysCompletionsForGoals(),
			});
		},
	});
};

export const useUpdateCompletion = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			goalId,
			userId,
			attachmentData,
		}: {
			goalId: string;
			userId: string;
			attachmentData: AttachmentData;
		}) => updateCompletionWithAttachment(goalId, userId, attachmentData),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: goalKeys.completions(variables.goalId, variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: goalKeys.todayCompletion(variables.goalId, variables.userId),
			});
		},
	});
};

export const useCreateInvite = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			goalId,
			inviterId,
			inviteeId,
		}: {
			goalId: string;
			inviterId: string;
			inviteeId: string;
		}) => createInvite(goalId, inviterId, inviteeId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: goalKeys.invites(variables.inviteeId),
			});
		},
	});
};

export const useAcceptInvite = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			inviteId,
			userId: _userId,
		}: {
			inviteId: string;
			userId: string;
		}) => acceptInvite(inviteId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: goalKeys.invites(variables.userId),
			});
			queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
		},
	});
};

export const useDeclineInvite = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			inviteId,
			userId: _userId,
		}: {
			inviteId: string;
			userId: string;
		}) => declineInvite(inviteId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: goalKeys.invites(variables.userId),
			});
		},
	});
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
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: goalKeys.detail(variables.goalId),
			});
		},
	});
};
