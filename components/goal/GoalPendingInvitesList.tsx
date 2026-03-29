import { Text, View } from "react-native";
import Avatar from "@/components/ui/Avatar";
import { useThemeColors } from "@/hooks/common/useThemeColors";

interface PendingInvite {
	id: string;
	invitee: {
		username: string;
		nickname?: string | null;
		avatar_url?: string | null;
	};
}

type GoalPendingInvitesListProps = {
	invites: PendingInvite[];
};

export function GoalPendingInvitesList({
	invites,
}: GoalPendingInvitesListProps) {
	const colors = useThemeColors();

	if (invites.length === 0) return null;

	return (
		<View className="w-full gap-3">
			<Text
				className="text-xl font-medium text-text-default"
				style={{ color: colors.textDefault }}
			>
				Pending
			</Text>

			<View className="gap-3">
				{invites.map((invite) => (
					<View
						key={invite.id}
						className="flex-row items-center justify-between rounded-[24px] border border-border bg-surface-fg px-4 py-3"
					>
						<View className="flex-row items-center gap-3">
							<Avatar
								name={invite.invitee.nickname || invite.invitee.username}
								imageUrl={invite.invitee.avatar_url ?? undefined}
								size={56}
							/>

							<View className="gap-1">
								<Text
									className="text-xl font-bold text-text-strong"
									style={{ color: colors.textStrong }}
								>
									{invite.invitee.nickname || invite.invitee.username}
								</Text>
								<Text
									className="text-base text-text-default"
									style={{ color: colors.textDefault }}
								>
									@{invite.invitee.username}
								</Text>
							</View>
						</View>

						<View className="rounded-full bg-state-muted-bg px-3 py-1.5">
							<Text
								className="text-xs font-medium uppercase"
								style={{ color: colors.textDefault }}
							>
								PENDING
							</Text>
						</View>
					</View>
				))}
			</View>
		</View>
	);
}
