import { useMutation, useQueryClient } from "@tanstack/react-query";
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
		onSuccess: (_, variables) => {
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
		},
	});
};

export const useUncompleteGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ goalId, userId }: { goalId: string; userId: string }) =>
			uncompleteGoal(goalId, userId),
		onSuccess: (_, variables) => {
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
