import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

async function registerPushToken(userId: string) {
	if (Platform.OS === "web") return;

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== "granted") {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== "granted") {
		console.log("Push notification permissions not granted");
		return;
	}

	const tokenData = await Notifications.getExpoPushTokenAsync();
	const token = tokenData.data;

	const { error } = await supabase
		.from("user_push_tokens")
		.upsert({ user_id: userId, token }, { onConflict: "user_id" });

	if (error) {
		console.error("Failed to register push token:", error);
	}
}

export function usePushNotifications(userId: string | undefined) {
	useEffect(() => {
		if (!userId) return;

		registerPushToken(userId);
	}, [userId]);
}
