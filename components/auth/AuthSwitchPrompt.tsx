import { Pressable, Text, View } from "react-native";

type AuthSwitchPromptProps = {
	promptText: string;
	actionText: string;
	onPress: () => void;
};

export default function AuthSwitchPrompt({
	promptText,
	actionText,
	onPress,
}: AuthSwitchPromptProps) {
	return (
		<View className="flex-row items-center justify-center gap-2">
			<Text className="text-text-light font-medium text-base">
				{promptText}
			</Text>
			<Pressable onPress={onPress}>
				<Text className="text-action-primary font-bold text-base">
					{actionText}
				</Text>
			</Pressable>
		</View>
	);
}
