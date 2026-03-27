import { Stack } from "expo-router";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/ToastConfig";
import { useProfile } from "@/hooks/profile/useProfileHooks";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";

export default function AppLayout() {
	const { user } = useAuthStore();
	const { data: profile, isLoading } = useProfile(user?.id);

	useEffect(() => {
		if (!isLoading && profile === null && user) {
			supabase.auth.signOut();
		}
	}, [isLoading, profile, user]);

	if (isLoading) return null;

	return (
		<>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(drawer)" />
				<Stack.Screen name="goal/new" options={{ presentation: "modal" }} />
				<Stack.Screen name="goal/[id]" options={{ presentation: "modal" }} />
				<Stack.Screen
					name="goal/edit/[id]"
					options={{ presentation: "modal" }}
				/>
			</Stack>
			<Toast config={toastConfig} />
		</>
	);
}
