import type { ReactNode, RefObject } from "react";
import type { ScrollView as RNScrollView } from "react-native";
import { FormShell } from "@/components/forms/FormShell";

type AuthFormShellProps = {
	scrollViewRef: RefObject<RNScrollView | null>;
	insetsBottom: number;
	keyboardHeight: number;
	children: ReactNode;
	contentClassName?: string;
};

export function AuthFormShell({
	scrollViewRef,
	insetsBottom,
	keyboardHeight,
	children,
	contentClassName,
}: AuthFormShellProps) {
	return (
		<FormShell
			variant="auth"
			scrollViewRef={scrollViewRef}
			insetsBottom={insetsBottom}
			keyboardHeight={keyboardHeight}
			contentClassName={contentClassName}
		>
			{children}
		</FormShell>
	);
}

export default AuthFormShell;
