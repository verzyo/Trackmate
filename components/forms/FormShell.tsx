import type { ReactNode, RefObject } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	type ScrollView as RNScrollView,
	ScrollView,
	View,
} from "react-native";
import { Screen } from "@/components/layout/Screen";
import PageHeader from "@/components/ui/PageHeader";
import { cn } from "@/utils/cn";

type FormShellVariant = "auth" | "goal";

type FormShellProps = {
	variant: FormShellVariant;
	scrollViewRef: RefObject<RNScrollView | null>;
	insetsBottom: number;
	keyboardHeight: number;
	children: ReactNode;
	isDark?: boolean;
	title?: string;
	contentClassName?: string;
};

export function FormShell({
	variant,
	scrollViewRef,
	insetsBottom,
	keyboardHeight,
	children,
	isDark = false,
	title,
	contentClassName,
}: FormShellProps) {
	const isAuth = variant === "auth";

	return (
		<Screen className="bg-surface-bg">
			<View className={cn("flex-1", isDark ? "dark" : "")}>
				<KeyboardAvoidingView
					behavior="height"
					keyboardVerticalOffset={0}
					className="flex-1"
				>
					<ScrollView
						ref={scrollViewRef}
						showsVerticalScrollIndicator={false}
						automaticallyAdjustKeyboardInsets
						keyboardDismissMode="on-drag"
						keyboardShouldPersistTaps="handled"
						contentContainerClassName={
							isAuth
								? "flex-grow items-center justify-center px-6 py-10"
								: "flex-grow px-6 py-4"
						}
						contentContainerStyle={{
							paddingBottom:
								Math.max(insetsBottom + 24, 32) +
								(Platform.OS === "android" ? keyboardHeight : 0),
						}}
					>
						{title ? <PageHeader title={title} /> : null}
						<View
							className={cn(
								isAuth ? "w-full max-w-md gap-10" : "flex-1 gap-8",
								contentClassName,
							)}
						>
							{children}
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</View>
		</Screen>
	);
}
