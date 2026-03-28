import FilledButton from "@/components/ui/FilledButton";
import { useDeleteGoal, useLeaveGoal } from "@/hooks/goal/useGoalMutations";
import { router } from "expo-router";

interface GoalEditActionsProps {
	goalId: string;
	isOwner: boolean;
}

export function GoalEditActions({ goalId, isOwner }: GoalEditActionsProps) {
	const deleteGoalMutation = useDeleteGoal();
	const leaveGoalMutation = useLeaveGoal();

	if (isOwner) {
		return (
			<FilledButton
				onPress={() => {
					deleteGoalMutation.mutate(goalId, {
						onSuccess: () => router.push("/app/(drawer)/(tabs)"),
					});
				}}
				disabled={deleteGoalMutation.isPending}
				variant="danger"
				label={
					deleteGoalMutation.isPending ? "Deleting goal..." : "Delete Goal"
				}
			/>
		);
	}

	return (
		<FilledButton
			onPress={() => {
				leaveGoalMutation.mutate(goalId, {
					onSuccess: () => router.push("/app/(drawer)/(tabs)"),
				});
			}}
			disabled={leaveGoalMutation.isPending}
			variant="danger"
			label={leaveGoalMutation.isPending ? "Leaving..." : "Leave Goal"}
		/>
	);
}

export default GoalEditActions;
