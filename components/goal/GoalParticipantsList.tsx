import { Text, View } from "react-native";
import Avatar from "@/components/ui/Avatar";
import { useThemeColors } from "@/hooks/common/useThemeColors";

type ParticipantItem = {
	id: string;
	name: string;
	username: string;
	avatarUrl?: string;
	completed?: boolean;
	role: "owner" | "member";
};

type GoalParticipantsListProps = {
	participants: ParticipantItem[];
};

export function GoalParticipantsList({
	participants,
}: GoalParticipantsListProps) {
	const colors = useThemeColors();

	return (
		<View className="w-full gap-4">
			<Text
				className="text-xl font-medium text-text-default"
				style={{ color: colors.textDefault }}
			>
				Participants
			</Text>

			<View className="gap-3">
				{participants.map((participant) => (
					<View
						key={participant.id}
						className="flex-row items-center justify-between rounded-full border border-border bg-surface-fg px-4 py-3"
					>
						<View className="flex-row items-center gap-3">
							<Avatar
								name={participant.name}
								imageUrl={participant.avatarUrl}
								completed={participant.completed}
								size={56}
							/>

							<View className="gap-0.5">
								<Text
									className="text-xl font-bold text-text-strong"
									style={{ color: colors.textStrong }}
								>
									{participant.name}
								</Text>
								<Text
									className="text-base text-text-default"
									style={{ color: colors.textDefault }}
								>
									@{participant.username}
								</Text>
							</View>
						</View>

						<View className="rounded-full bg-state-muted-bg px-3 py-1.5">
							<Text
								className="text-xs font-medium uppercase"
								style={{ color: colors.textDefault }}
							>
								{participant.role}
							</Text>
						</View>
					</View>
				))}
			</View>
		</View>
	);
}
