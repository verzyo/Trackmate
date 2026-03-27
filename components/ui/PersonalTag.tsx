import { Text, View } from "react-native";

interface PersonalTagProps {
	muted?: boolean;
}

export default function PersonalTag({ muted }: PersonalTagProps) {
	return (
		<View className="items-center justify-center rounded-full bg-label-bg px-3 py-0.5">
			<Text
				className={`text-xs font-semibold uppercase tracking-wider ${
					muted ? "text-text-light" : "text-label-fg"
				}`}
			>
				Personal
			</Text>
		</View>
	);
}
