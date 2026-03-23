import { useEffect } from "react";
import { type Href, router } from "expo-router";
import { Button, ScrollView, Text, View, Pressable } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { useGoals } from "@/hooks/goal/useGoals";
import { fetchGoal } from "@/lib/api/goal.api";
import { queryClient } from "@/lib/queryClient";
import { goalQueryKeys } from "@/hooks/goal/useGoal";

export default function HomeScreen() {
	const { data: goals, isLoading, error } = useGoals();

	useEffect(() => {
		if (goals) {
			for (const goal of goals) {
				queryClient.prefetchQuery({
					queryKey: goalQueryKeys.goal(goal.id),
					queryFn: () => fetchGoal(goal.id),
				});
			}
		}
	}, [goals]);

	return (
		<Screen className="px-6 py-4">
			<ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4">
				<Button
					title="NEW GOAL"
					onPress={() => router.push("/app/goal/new" as Href)}
				/>

				{isLoading && <Text>Loading goals...</Text>}
				{error && <Text className="text-red-500">Failed to load goals</Text>}

				{goals?.length === 0 && <Text>You don't have any goals yet</Text>}

				{goals?.map((goal) => (
					<Pressable
						key={goal.id}
						className="py-3 border-b border-neutral-200 w-full items-center"
						onPress={() => router.push(`/app/goal/${goal.id}` as Href)}
					>
						<Text className="text-lg">{goal.title}</Text>
					</Pressable>
				))}
			</ScrollView>
		</Screen>
	);
}
