import { Analytics } from "@vercel/analytics/react";
import { Stack } from "expo-router";
import { Platform } from "react-native";

import "@/global.css";

export default function RootLayout() {
	return (
		<>
			{Platform.OS === "web" && <Analytics />}
			<Stack screenOptions={{ headerShown: false }} />
		</>
	);
}
