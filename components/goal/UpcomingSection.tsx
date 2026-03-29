import { Text, View } from "react-native";
import { GoalItem } from "@/components/goal/GoalItem";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { getIconComponent } from "@/utils/icons";

type UpcomingSectionProps = {
	goals: (GoalWithParticipant & { daysUntil: number })[];
	userId: string | undefined;
	participantAvatars: Record<
		string,
		Array<{
			user_id: string;
			name: string;
			imageUrl?: string;
			completed: boolean;
		}>
	>;
	onPress: (goalId: string) => void;
};

export function UpcomingSection({
	goals,
	userId,
	participantAvatars,
	onPress,
}: UpcomingSectionProps) {
	if (goals.length === 0) return null;

	return (
		<View className="mt-2 flex-col items-start justify-start gap-3">
			<Text className="font-semibold text-lg leading-7 text-text-strong">
				Upcoming
			</Text>
			<View className="w-full flex-col items-start justify-start gap-3">
				{goals.map((goal) => {
					const participant = goal.goal_participants?.find(
						(p) => p.user_id === userId,
					);
					return (
						<GoalItem
							key={goal.id}
							goal={goal}
							variant="upcoming"
							userId={userId}
							subtitle={`in ${goal.daysUntil} ${goal.daysUntil === 1 ? "day" : "days"}`}
							icon={getIconComponent(participant?.icon || "Target")}
							color={participant?.color || "#4f46e5"}
							onPress={() => onPress(goal.id)}
							participantAvatars={participantAvatars[goal.id] || []}
						/>
					);
				})}
			</View>
		</View>
	);
}
