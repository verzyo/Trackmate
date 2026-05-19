import { ModalScreen } from "@/components/layout/ModalScreen";
import { cn } from "@/utils/cn";
import type { ReactNode, RefObject } from "react";
import {
    type ScrollView as RNScrollView,
    View,
} from "react-native";

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
		<ModalScreen
			ref={scrollViewRef}
			title={title || ""}
			contentContainerClassName={cn(
				isAuth ? "items-center justify-center" : "",
				contentClassName,
			)}
		>
			<View
				className={cn(
					isAuth ? "w-full max-w-md gap-10" : "w-full max-w-3xl gap-6",
					isDark && "dark",
				)}
			>
				{children}
			</View>
		</ModalScreen>
	);
}
