import { useKeyboard } from "./useKeyboard";

export function useAndroidKeyboardHeight() {
	const { keyboardHeight } = useKeyboard();
	return keyboardHeight;
}
