import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { cn } from "@/utils/cn";

type FormSectionProps = {
	title: string;
	children: ReactNode;
	titleColor?: string;
	className?: string;
	titleClassName?: string;
};

export function FormSection({
	title,
	children,
	titleColor,
	className,
	titleClassName,
}: FormSectionProps) {
	return (
		<View className={cn("gap-4", className)}>
			<Text
				className={cn("font-bold text-lg text-text-strong", titleClassName)}
				style={titleColor ? { color: titleColor } : undefined}
			>
				{title}
			</Text>
			{children}
		</View>
	);
}
