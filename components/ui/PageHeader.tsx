import { useNavigation, useRouter } from "expo-router";
import { ArrowLeft } from "phosphor-react-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { UI_SIZES } from "@/constants/ui";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import CircleIconButton from "./CircleIconButton";

type PageHeaderProps = {
	title: string;
	onBack?: () => void;
	rightElement?: ReactNode;
};

export function PageHeader({ title, onBack, rightElement }: PageHeaderProps) {
	const router = useRouter();
	const navigation = useNavigation();
	const colors = useThemeColors();

	const handleBack = () => {
		if (onBack) {
			onBack();
			return;
		}

		// Check if we can go back in the navigation state
		if (navigation.canGoBack()) {
			router.back();
		} else {
			// Fallback to home when no previous screen exists (direct navigation/refresh on web)
			router.replace("/app");
		}
	};

	return (
		<View className="mb-6 h-16 w-full flex-row items-center justify-between">
			<CircleIconButton onPress={handleBack} hitSlop={8}>
				<ArrowLeft size={UI_SIZES.icon.md} color={colors.textStrong} />
			</CircleIconButton>

			<Text className="flex-1 text-center font-bold text-2xl text-text-strong">
				{title}
			</Text>

			{rightElement ? (
				<View className="h-12 w-12 items-center justify-center">
					{rightElement}
				</View>
			) : (
				<View className="w-12" />
			)}
		</View>
	);
}

export default PageHeader;
