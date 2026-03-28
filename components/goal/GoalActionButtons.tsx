import { View } from "react-native";
import FilledButton from "@/components/ui/FilledButton";
import MutedBorderButton from "@/components/ui/MutedBorderButton";

type GoalActionButtonsProps = {
	showPrimaryAction: boolean;
	isInviteState: boolean;
	isCompletedToday: boolean;
	isPending: boolean;
	insetsBottom: number;
	primaryButtonLabel: string;
	secondaryButtonLabel: string;
	onAcceptInvite: () => void;
	onCompleteGoal: () => void;
	onUndoComplete: () => void;
	onDeclineInvite: () => void;
};

export function GoalActionButtons({
	showPrimaryAction,
	isInviteState,
	isCompletedToday,
	isPending,
	insetsBottom,
	primaryButtonLabel,
	secondaryButtonLabel,
	onAcceptInvite,
	onCompleteGoal,
	onUndoComplete,
	onDeclineInvite,
}: GoalActionButtonsProps) {
	if (!showPrimaryAction) return null;

	return (
		<View
			className="absolute bottom-0 left-0 right-0 px-6 pt-4"
			style={{ paddingBottom: Math.max(insetsBottom, 16) }}
			pointerEvents="box-none"
		>
			<View className="gap-3">
				{isCompletedToday && !isInviteState ? (
					<MutedBorderButton
						onPress={onUndoComplete}
						disabled={isPending}
						label={primaryButtonLabel}
					/>
				) : (
					<FilledButton
						onPress={isInviteState ? onAcceptInvite : onCompleteGoal}
						disabled={isPending}
						withShadow={false}
						label={primaryButtonLabel}
					/>
				)}

				{isInviteState ? (
					<MutedBorderButton
						onPress={onDeclineInvite}
						disabled={isPending}
						className="h-14 bg-surface-fg"
						labelClassName="text-base"
						label={secondaryButtonLabel}
					/>
				) : null}
			</View>
		</View>
	);
}
