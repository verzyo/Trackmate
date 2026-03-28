import { getErrorMessage, showAlert } from "@/utils/error.utils";

export function useErrorHandler() {
	const handleError = (error: unknown, fallback?: string, title = "Error") => {
		showAlert(getErrorMessage(error, fallback), title);
	};

	const showSuccess = (message: string, title = "Success") => {
		showAlert(message, title);
	};

	return { handleError, showSuccess };
}
