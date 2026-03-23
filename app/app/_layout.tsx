import { Tabs } from "expo-router";
import { useProfile } from "@/hooks/profile/useProfile";
import { useAuthStore } from "@/lib/store/auth.store";
export default function AppLayout() {
	const { user } = useAuthStore();

	useProfile(user?.id ?? "");

	return (
		<Tabs screenOptions={{ headerShown: false }}>
			<Tabs.Screen name="index" options={{ title: "Home" }} />
			<Tabs.Screen name="profile" options={{ title: "Profile" }} />
		</Tabs>
	);
}
