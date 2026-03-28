import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable, Text, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/ToastConfig";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth.store";

import "@/global.css";

class RootErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ hasError: boolean }
> {
	state = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return (
				<View
					style={{ flex: 1 }}
					className="items-center justify-center bg-surface-bg px-6"
				>
					<Text className="text-text-strong font-bold text-xl text-center">
						Something went wrong
					</Text>
					<Text className="text-text-light text-base text-center mt-2">
						Please restart the app.
					</Text>
					<Pressable
						onPress={() => this.setState({ hasError: false })}
						className="mt-6 h-12 px-5 rounded-xl bg-action-primary items-center justify-center"
					>
						<Text className="text-white font-bold">Try again</Text>
					</Pressable>
				</View>
			);
		}

		return this.props.children;
	}
}

export default function RootLayout() {
	const { initialize, initialized, session } = useAuthStore();
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";
	const stackBackgroundColor = isDark ? "#0f172a" : "#f8fafc";

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
						<View className={`${isDark ? "dark " : ""}flex-1 bg-surface-bg`}>
							{Platform.OS === "web" && <Analytics />}
							<Stack
								screenOptions={{
									headerShown: false,
									contentStyle: { backgroundColor: stackBackgroundColor },
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
