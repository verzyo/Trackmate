import {
	useCompleteGoal,
	useUncompleteGoal,
} from "@/hooks/goal/useGoalMutations";
import type { AttachmentData } from "@/schemas/goal.schema";

export function useGoalToggle(userId: string | undefined) {
	const completeMutation = useCompleteGoal();
	const uncompleteMutation = useUncompleteGoal();

	const pendingGoalId = completeMutation.isPending
		? completeMutation.variables?.goalId
		: uncompleteMutation.isPending
			? uncompleteMutation.variables?.goalId
			: null;

	const toggleCompletion = async (
		goalId: string,
		isCompleted: boolean,
		attachmentData?: AttachmentData,
	) => {
		if (!userId) return;
		if (isCompleted) {
			await uncompleteMutation.mutateAsync({ goalId, userId });
		} else {
			await completeMutation.mutateAsync({ goalId, userId, attachmentData });
		}
	};

	return {
		toggleCompletion,
		pendingGoalId,
	};
}
