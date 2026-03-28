import type { ReactNode, RefObject } from "react";
import type { ScrollView as RNScrollView } from "react-native";
import { FormShell } from "@/components/forms/FormShell";

type GoalFormShellProps = {
	title: string;
	scrollViewRef: RefObject<RNScrollView | null>;
	insetsBottom: number;
	keyboardHeight: number;
	isDark: boolean;
	children: ReactNode;
};

export function GoalFormShell({
	title,
	scrollViewRef,
	insetsBottom,
	keyboardHeight,
	isDark,
	children,
}: GoalFormShellProps) {
	return (
		<FormShell
			variant="goal"
			title={title}
			scrollViewRef={scrollViewRef}
			insetsBottom={insetsBottom}
			keyboardHeight={keyboardHeight}
			isDark={isDark}
		>
			{children}
		</FormShell>
	);
}
