import { FilledButton } from "@/components/ui/FilledButton";
import { View } from "react-native";

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
			<View className="w-full max-w-3xl self-center gap-3">
				{isCompletedToday && !isInviteState ? (
					<FilledButton
						onPress={onUndoComplete}
						disabled={isPending}
						variant="muted"
						withShadow={false}
						className="bg-label-bg opacity-100"
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
					<FilledButton
						onPress={onDeclineInvite}
						disabled={isPending}
						variant="muted"
						withShadow={false}
						className="h-14 bg-surface-fg"
						labelClassName="text-base"
						label={secondaryButtonLabel}
					/>
				) : null}
			</View>
		</View>
	);
}
