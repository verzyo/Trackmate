import { Analytics } from "@vercel/analytics/react";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useAuthStore } from "@/lib/store/auth.store";

import "@/global.css";

export default function RootLayout() {
	const { initialize, initialized, session } = useAuthStore();

	useEffect(() => {
		const unsubscribe = initialize();
		return () => unsubscribe();
	}, [initialize]);

	if (!initialized) return null;

	return (
		<>
			{Platform.OS === "web" && <Analytics />}
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Protected guard={!session}>
					<Stack.Screen name="login" />
					<Stack.Screen name="register" />
				</Stack.Protected>

				<Stack.Protected guard={!!session}>
					<Stack.Screen name="app" />
				</Stack.Protected>

				<Stack.Protected guard={Platform.OS === "web"}>
					<Stack.Screen name="index" />
				</Stack.Protected>
			</Stack>
		</>
	);
}
