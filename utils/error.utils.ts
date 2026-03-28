import { showToast } from "@/utils/toast";

export const showAlert = (message: string, title = "Error"): void => {
	showToast(title === "Error" ? "error" : "success", title, message);
};

export const getErrorMessage = (
	error: unknown,
	fallback = "Something went wrong",
): string => {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	return fallback;
};
