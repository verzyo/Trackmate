import {
	useCompleteGoal,
	useUncompleteGoal,
} from "@/hooks/goal/useGoalMutations";
import type { AttachmentData } from "@/schemas/goal.schema";

/**
 * Hook to manage goal completion toggling.
 *
 * @param userId - The current user's ID.
 * @returns An object with the `toggleCompletion` function and `pendingGoalId`.
 */
export function useGoalToggle(userId: string | undefined) {
	const completeMutation = useCompleteGoal();
	const uncompleteMutation = useUncompleteGoal();

	const pendingGoalId = completeMutation.isPending
		? completeMutation.variables?.goalId
		: uncompleteMutation.isPending
			? uncompleteMutation.variables?.goalId
			: null;

	/**
	 * Toggles the completion state of a goal for the current user.
	 *
	 * @param goalId - The ID of the goal to toggle.
	 * @param isCompleted - The current completion state.
	 * @param attachmentData - Optional data if an attachment (photo, text, etc.) is required.
	 */
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
