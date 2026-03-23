import { type Href, router } from "expo-router";
import { Button, Pressable, ScrollView, Text } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { useGoals } from "@/hooks/goal/useGoals";

export default function HomeScreen() {
	const { data: goals, isLoading, error } = useGoals();

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
