import { Stack } from "expo-router";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { useLoadHomeScreen } from "@/hooks/common/useLoadHomeScreen";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { useAuthStore } from "@/store/auth.store";

export default function AppLayout() {
	const { user } = useAuthStore();
	const { isLoading } = useLoadHomeScreen(user?.id);
	const colors = useThemeColors();

	if (isLoading) {
		return <LoadingScreen />;
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: colors.surfaceBg },
			}}
		>
			<Stack.Screen name="(drawer)" />
			<Stack.Screen name="goal/new" options={{ presentation: "modal" }} />
			<Stack.Screen name="goal/[id]" options={{ presentation: "modal" }} />
			<Stack.Screen name="goal/edit/[id]" options={{ presentation: "modal" }} />
		</Stack>
	);
}
