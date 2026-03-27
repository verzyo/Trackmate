import { Alert, Platform } from "react-native";

/**
 * Cross-platform alert helper.
 * On web, uses window.alert. On native, uses React Native Alert.alert.
 */
export const showAlert = (message: string, title = "Error"): void => {
	if (Platform.OS === "web") {
		window.alert(message);
	} else {
		Alert.alert(title, message);
	}
};

/**
 * Extracts a user-friendly error message from an unknown error.
 */
export const getErrorMessage = (
	error: unknown,
	fallback = "Something went wrong",
): string => {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	return fallback;
};
