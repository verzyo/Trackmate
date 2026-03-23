import { Stack } from "expo-router";

export default function AppLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="goal/new" options={{ presentation: "modal" }} />
			<Stack.Screen name="goal/[id]" options={{ presentation: "modal" }} />
			<Stack.Screen name="goal/edit/[id]" options={{ presentation: "modal" }} />
		</Stack>
	);
}
