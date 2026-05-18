import { cn } from "@/utils/cn";
import type { ReactNode } from "react";
import { useColorScheme, View, type ViewProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = ViewProps & {
	children: ReactNode;
	className?: string;
	scrollable?: boolean;
	contentContainerClassName?: string;
};

export const Screen = ({
	children,
	className,
	scrollable = false,
	contentContainerClassName,
	...props
}: ScreenProps) => {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	const innerContent = (
		<SafeAreaView className={cn(!scrollable && "flex-1", className)} {...props}>
			{children}
		</SafeAreaView>
	);

	return (
		<View className={cn("flex-1 bg-surface-bg", isDark && "dark")}>
			{scrollable ? (
				<KeyboardAwareScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ flexGrow: 1 }}
					contentContainerClassName={cn(contentContainerClassName)}
					enableOnAndroid={true}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					{innerContent}
				</KeyboardAwareScrollView>
			) : (
				<View className={cn("flex-1", contentContainerClassName)} {...props}>
					{innerContent}
				</View>
			)}
		</View>
	);
};

export default Screen;
