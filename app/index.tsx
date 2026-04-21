import { Redirect } from "expo-router";
import { Platform } from "react-native";

export default function LandingScreen() {
	if (Platform.OS !== "web") {
		return null;
	}

	return <Redirect href={"/app"} />;
}
