import Toast from "react-native-toast-message";

/**
 * Cross-platform alert helper.
 * Uses Toast notifications for a consistent UI across platforms.
 */
export const showAlert = (message: string, title = "Error"): void => {
	Toast.show({
		type: title === "Error" ? "error" : "success",
		text1: title,
		text2: message,
	});
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
