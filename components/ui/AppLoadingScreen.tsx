import { ActivityIndicator, Text, View } from "react-native";
import { useThemeColors } from "@/hooks/common/useThemeColors";

type AppLoadingScreenProps = {
	message?: string;
};

export function AppLoadingScreen({
	message = "Loading, please wait...",
}: AppLoadingScreenProps) {
	const colors = useThemeColors();

	return (
		<View
			className="flex-1 items-center justify-center px-8"
			style={{ backgroundColor: colors.surfaceBg }}
		>
			<View className="items-center gap-4 rounded-3xl px-8 py-7">
				<ActivityIndicator size="large" color={colors.actionPrimary} />
				<Text
					className="text-base font-medium text-text-light"
					style={{ color: colors.textLight }}
				>
					{message}
				</Text>
			</View>
		</View>
	);
}

export default AppLoadingScreen;
