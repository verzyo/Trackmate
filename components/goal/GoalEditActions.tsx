import { router } from "expo-router";
import FilledButton from "@/components/ui/FilledButton";
import MutedBorderButton from "@/components/ui/MutedBorderButton";
import { useDeleteGoal, useLeaveGoal } from "@/hooks/goal/useGoalMutations";

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
		<MutedBorderButton
			onPress={() => {
				leaveGoalMutation.mutate(goalId, {
					onSuccess: () => router.push("/app/(drawer)/(tabs)"),
				});
			}}
			disabled={leaveGoalMutation.isPending}
			label={leaveGoalMutation.isPending ? "Leaving..." : "Leave Goal"}
		/>
	);
}

export default GoalEditActions;
