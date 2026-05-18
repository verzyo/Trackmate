import { RootErrorBoundary } from "@/components/layout/RootErrorBoundary";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/utils/cn";
import { toastConfig } from "@/utils/toast";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import "@/global.css";

export default function RootLayout() {
	const { initialize, initialized, session } = useAuthStore();
	const colors = useThemeColors();
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	useEffect(() => {
		const unsubscribe = initialize();
		return () => unsubscribe();
	}, [initialize]);

	if (!initialized) return null;

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<BottomSheetModalProvider>
				<QueryClientProvider client={queryClient}>
					<RootErrorBoundary>
						<View className={cn("flex-1 bg-surface-bg", isDark && "dark")}>
							{Platform.OS === "web" && <Analytics />}
							<Stack
								screenOptions={{
									headerShown: false,
									contentStyle: { backgroundColor: colors.surfaceBg },
								}}
							>
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
							<Toast config={toastConfig} />
						</View>
					</RootErrorBoundary>
				</QueryClientProvider>
			</BottomSheetModalProvider>
		</GestureHandlerRootView>
	);
}
