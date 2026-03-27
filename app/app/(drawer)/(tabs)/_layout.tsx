import { Tabs } from "expo-router";
import { useInvites } from "@/hooks/goal/useGoalQueries";
import { useProfile } from "@/hooks/profile/useProfileHooks";
import { useAuthStore } from "@/store/auth.store";

export default function AppLayout() {
	const { user } = useAuthStore();

	useProfile(user?.id);
	useInvites(user?.id);

	return (
		<Tabs screenOptions={{ headerShown: false }}>
			<Tabs.Screen name="index" options={{ title: "Home" }} />
		</Tabs>
	);
}
