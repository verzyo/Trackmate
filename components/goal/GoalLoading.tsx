import { ActivityIndicator, View } from "react-native";
import { useThemeColors } from "@/hooks/common/useThemeColors";

export function GoalLoading() {
	const colors = useThemeColors();
	return (
		<View className="w-full items-center justify-center py-8">
			<ActivityIndicator size="large" color={colors.actionPrimary} />
		</View>
	);
}

export default GoalLoading;
