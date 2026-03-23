import { ScrollView, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { useGoals } from "@/hooks/goal/useGoals";

export default function HomeScreen() {
	const { data: goals, isLoading, error } = useGoals();

	return (
		<Screen className="px-6 py-4">
			<ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4">
				{isLoading && <Text>Loading goals...</Text>}
				{error && <Text className="text-red-500">Failed to load goals</Text>}

				{goals?.length === 0 && <Text>You don't have any goals yet</Text>}

				{goals?.map((goal) => (
					<View
						key={goal.id}
						className="py-3 border-b border-neutral-200 w-full items-center"
					>
						<Text className="text-lg">{goal.title}</Text>
					</View>
				))}
			</ScrollView>
		</Screen>
	);
}
