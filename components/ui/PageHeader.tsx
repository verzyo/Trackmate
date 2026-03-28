import { useRouter } from "expo-router";
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
	const colors = useThemeColors();

	return (
		<View className="mb-6 h-16 w-full flex-row items-center justify-between">
			<CircleIconButton onPress={onBack || (() => router.back())} hitSlop={8}>
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
