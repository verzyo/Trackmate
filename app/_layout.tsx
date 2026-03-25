import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { queryClient } from "@/lib/queryClient";
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
		<GestureHandlerRootView style={{ flex: 1 }}>
			<BottomSheetModalProvider>
				<QueryClientProvider client={queryClient}>
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
				</QueryClientProvider>
			</BottomSheetModalProvider>
		</GestureHandlerRootView>
	);
}
