import { type Href, router, useLocalSearchParams } from "expo-router";
import { Button, ScrollView, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { useGoal } from "@/hooks/goal/useGoal";

export default function GoalDetailsModal() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: goal, isLoading, error } = useGoal(id as string);

	if (isLoading) {
		return (
			<Screen className="px-6 py-4 justify-center items-center">
				<Text>Loading details...</Text>
			</Screen>
		);
	}

	if (error || !goal) {
		return (
			<Screen className="px-6 py-4 justify-center items-center">
				<Text className="text-red-500">Failed to load goal details</Text>
			</Screen>
		);
	}

	const participant = goal.goal_participants?.[0];

	return (
		<Screen className="px-6 py-4">
			<ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4">
				<Text>Title: {goal.title}</Text>
				<Text>Description: {goal.description || "No description"}</Text>

				{participant && (
					<>
						<Text>Frequency: {participant.frequency_type}</Text>

						{participant.frequency_type === "interval" &&
							participant.interval_days && (
								<Text>Every: {participant.interval_days} days</Text>
							)}

						{participant.frequency_type === "weekly" &&
							participant.weekly_days && (
								<Text>Days of week: {participant.weekly_days.join(", ")}</Text>
							)}

						<Text>
							Anchor Date:{" "}
							{new Date(participant.anchor_date).toLocaleDateString()}
						</Text>
					</>
				)}

				<View className="mt-8 w-full max-w-xs">
					<Button
						title="EDIT GOAL"
						onPress={() => router.push(`/app/goal/edit/${id}` as Href)}
					/>
				</View>
			</ScrollView>
		</Screen>
	);
}
