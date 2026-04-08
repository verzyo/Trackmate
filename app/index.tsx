import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const APK_URL = "https://expo.dev/artifacts/eas/iHKvgauXFrbE1ZSmgH2QcW.apk";

export default function LandingScreen() {
	if (Platform.OS !== "web") {
		return null;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Trackmate</Text>
			<TouchableOpacity
				style={styles.button}
				onPress={() => {
					window.location.href = APK_URL;
				}}
			>
				<Text style={styles.buttonText}>Download APK</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#1A1A1D",
		padding: 24,
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
		color: "#FFFFFF",
		marginBottom: 32,
	},
	button: {
		backgroundColor: "#B5FED9",
		paddingHorizontal: 24,
		paddingVertical: 16,
		borderRadius: 12,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1A1A1D",
	},
});
