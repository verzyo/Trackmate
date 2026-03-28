import { Stack } from "expo-router";
import AppLoadingScreen from "@/components/ui/AppLoadingScreen";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { useProfile } from "@/hooks/profile/useProfileHooks";
import { useAuthStore } from "@/store/auth.store";

export default function AppLayout() {
	const { user } = useAuthStore();
	const { isLoading } = useProfile(user?.id);
	const colors = useThemeColors();

	if (isLoading) {
		return <AppLoadingScreen />;
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
