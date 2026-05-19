import { cn } from "@/utils/cn";
import React, { type ReactNode } from "react";
import { useColorScheme, View, type ViewProps, type ScrollView } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = ViewProps & {
	children: ReactNode;
	className?: string;
	scrollable?: boolean;
	contentContainerClassName?: string;
	contentContainerStyle?: any;
	refreshControl?: React.ReactElement<any>;
	fixedChildren?: ReactNode;
};

export const Screen = React.forwardRef<ScrollView, ScreenProps>(
	(
		{
			children,
			className,
			scrollable = false,
			contentContainerClassName,
			contentContainerStyle,
			refreshControl,
			fixedChildren,
			...props
		},
		ref,
	) => {
		const colorScheme = useColorScheme();
		const isDark = colorScheme === "dark";

		const innerContent = (
			<SafeAreaView
				className={cn(!scrollable && "flex-1", className)}
				{...props}
			>
				{children}
			</SafeAreaView>
		);

		return (
			<View className={cn("flex-1 bg-surface-bg", isDark && "dark")}>
				{scrollable ? (
					<KeyboardAwareScrollView
						ref={ref as any}
						style={{ flex: 1 }}
						contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
						contentContainerClassName={cn(contentContainerClassName)}
						enableOnAndroid={true}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
						refreshControl={refreshControl}
					>
						{innerContent}
					</KeyboardAwareScrollView>
				) : (
					<View
						className={cn("flex-1", contentContainerClassName)}
						style={contentContainerStyle}
						{...props}
					>
						{innerContent}
					</View>
				)}
				{fixedChildren}
			</View>
		);
	},
);

export default Screen;
