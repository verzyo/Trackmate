import { useEffect, useState } from "react";
import { Keyboard, LayoutAnimation, Platform, UIManager } from "react-native";

export function useKeyboard() {
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

	useEffect(() => {
		if (Platform.OS === "android") {
			UIManager.setLayoutAnimationEnabledExperimental?.(true);
		}
	}, []);

	useEffect(() => {
		const showEvent =
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
		const hideEvent =
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

		const showSub = Keyboard.addListener(showEvent, (event) => {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
			setKeyboardHeight(event.endCoordinates.height);
			setIsKeyboardVisible(true);
		});

		const hideSub = Keyboard.addListener(hideEvent, () => {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
			setKeyboardHeight(0);
			setIsKeyboardVisible(false);
		});

		return () => {
			showSub.remove();
			hideSub.remove();
		};
	}, []);

	return { keyboardHeight, isKeyboardVisible };
}
