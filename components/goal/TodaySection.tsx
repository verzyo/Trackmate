import { Text, View } from "react-native";
import { GoalItem } from "@/components/goal/GoalItem";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { getIconComponent } from "@/utils/icons";

type TodaySectionProps = {
	goals: (GoalWithParticipant & { isCompleted: boolean })[];
	userId: string | undefined;
	error: Error | null;
	showNoGoalsDueToday: boolean;
	participantAvatars: Record<
		string,
		Array<{
			user_id: string;
			name: string;
			imageUrl?: string;
			completed: boolean;
		}>
	>;
	onToggle: (goal: GoalWithParticipant, isCompleted: boolean) => void;
	onPress: (goalId: string) => void;
};

export function TodaySection({
	goals,
	userId,
	error,
	showNoGoalsDueToday,
	participantAvatars,
	onToggle,
	onPress,
}: TodaySectionProps) {
	return (
		<View className="flex-col items-start justify-start gap-4">
			<Text className="font-semibold text-lg leading-7 text-text-strong">
				Today
			</Text>
			<View className="w-full flex-col items-start justify-start gap-3.5">
				{error && (
					<Text className="text-base text-state-danger">
						Failed to load goals
					</Text>
				)}
				{showNoGoalsDueToday ? (
					<Text className="text-base text-text-light">No goals due today</Text>
				) : (
					goals.map((goal) => {
						const participant = goal.goal_participants?.find(
							(p) => p.user_id === userId,
						);
						return (
							<GoalItem
								key={goal.id}
								goal={goal}
								variant="today"
								userId={userId}
								isCompleted={goal.isCompleted}
								icon={getIconComponent(participant?.icon || "Target")}
								color={participant?.color || "#4f46e5"}
								onToggle={() => onToggle(goal, goal.isCompleted)}
								onPress={() => onPress(goal.id)}
								participantAvatars={participantAvatars[goal.id] || []}
							/>
						);
					})
				)}
			</View>
		</View>
	);
}
