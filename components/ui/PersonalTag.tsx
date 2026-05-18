import { Text, View } from "react-native";
import { cn } from "@/utils/cn";

interface PersonalTagProps {
	muted?: boolean;
}

export function PersonalTag({ muted }: PersonalTagProps) {
	return (
		<View className="items-center justify-center rounded-full bg-label-bg px-3 py-0.5">
			<Text
				className={cn(
					"text-xs font-semibold uppercase tracking-wider",
					muted ? "text-text-light" : "text-label-fg",
				)}
			>
				Personal
			</Text>
		</View>
	);
}

export default PersonalTag;
