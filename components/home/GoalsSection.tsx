import { Text, View } from "react-native";
import { GoalCard } from "@/components/home/GoalCard";
import type { GoalWithParticipant } from "@/schemas/goal.schema";

type GoalsSectionProps = {
	title: string;
	goals: (GoalWithParticipant & {
		isCompleted?: boolean;
		daysUntil?: number;
	})[];
	userId: string | undefined;
	isLoading?: boolean;
	error?: Error | null;
	emptyMessage?: string;
	participantAvatars: Record<
		string,
		Array<{
			user_id: string;
			name: string;
			imageUrl?: string;
			completed: boolean;
		}>
	>;
	onToggle?: (goal: GoalWithParticipant, isCompleted: boolean) => void;
	onPress: (goalId: string) => void;
};

export function GoalsSection({
	title,
	goals,
	userId,
	isLoading,
	error,
	emptyMessage,
	participantAvatars,
	onToggle,
	onPress,
}: GoalsSectionProps) {
	if (!isLoading && !error && goals.length === 0 && !emptyMessage) return null;

	return (
		<View className="flex-col items-start justify-start gap-3">
			<Text className="font-semibold text-lg leading-7 text-text-strong">
				{title}
			</Text>
			<View className="w-full flex-col items-start justify-start gap-3">
				{error ? (
					<Text className="text-base text-state-danger">
						Failed to load goals
					</Text>
				) : goals.length === 0 && emptyMessage ? (
					<Text className="text-base text-text-light">{emptyMessage}</Text>
				) : (
					goals.map((goal) => {
						const participant = goal.goal_participants?.find(
							(p) => p.user_id === userId,
						);
						const isUpcoming = goal.daysUntil !== undefined;

						return (
							<GoalCard
								key={goal.id}
								goal={goal}
								variant={isUpcoming ? "upcoming" : "today"}
								userId={userId}
								isCompleted={goal.isCompleted}
								daysDue={goal.daysUntil}
								iconName={participant?.icon || "Target"}
								color={participant?.color || "#4f46e5"}
								onToggle={
									onToggle
										? () => onToggle(goal, !!goal.isCompleted)
										: undefined
								}
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
