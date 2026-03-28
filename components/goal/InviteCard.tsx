import { Text, View } from "react-native";
import Avatar from "@/components/ui/Avatar";
import FilledButton from "@/components/ui/FilledButton";
import MutedBorderButton from "@/components/ui/MutedBorderButton";
import type { GoalInviteWithDetails } from "@/schemas/goal.schema";

type InviteCardProps = {
	invite: GoalInviteWithDetails;
	onAccept: () => void;
	onDecline: () => void;
	onViewDetails: () => void;
	disabled?: boolean;
};

export function InviteCard({
	invite,
	onAccept,
	onDecline,
	onViewDetails,
	disabled,
}: InviteCardProps) {
	return (
		<View className="gap-4 rounded-3xl border border-border bg-surface-fg p-5">
			<View className="flex-row items-center justify-between gap-4">
				<View className="flex-1 flex-row items-center gap-3">
					<Avatar
						size={44}
						name={invite.inviter.username}
						imageUrl={invite.inviter.avatar_url ?? undefined}
					/>
					<View className="flex-1">
						<Text
							className="text-lg font-bold text-text-strong"
							numberOfLines={1}
						>
							{invite.goal.title}
						</Text>
						<Text className="text-sm text-text-light" numberOfLines={1}>
							@{invite.inviter.username} invited you
						</Text>
					</View>
				</View>

				<View className="rounded-full bg-state-muted-bg px-3 py-1">
					<Text className="text-[10px] font-bold tracking-widest text-state-muted-fg">
						PENDING
					</Text>
				</View>
			</View>

			<View className="flex-row items-center gap-3">
				<FilledButton
					onPress={onAccept}
					disabled={disabled}
					label="Accept"
					className="h-12 flex-1 rounded-2xl"
					labelClassName="text-base"
				/>

				<FilledButton
					onPress={onDecline}
					disabled={disabled}
					label="Decline"
					variant="danger"
					className="h-12 flex-1 rounded-2xl"
					labelClassName="text-base"
				/>

				<MutedBorderButton
					onPress={onViewDetails}
					disabled={disabled}
					label="Preview"
					className="h-12 flex-1 rounded-2xl"
					labelClassName="text-base"
				/>
			</View>
		</View>
	);
}

export default InviteCard;
