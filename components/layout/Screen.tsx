import type { ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";

type ScreenProps = ViewProps & {
	children: React.ReactNode;
	className?: string;
};

export const Screen = ({ children, className, ...props }: ScreenProps) => (
	<SafeAreaView className={cn("flex-1", className)} {...props}>
		{children}
	</SafeAreaView>
);
