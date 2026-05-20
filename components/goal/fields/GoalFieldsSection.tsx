import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { cn } from "@/utils/cn";

type GoalFieldsSectionProps = {
	title: string;
	children: ReactNode;
	className?: string;
	titleClassName?: string;
};

export function GoalFieldsSection({
	title,
	children,
	className,
	titleClassName,
}: GoalFieldsSectionProps) {
	return (
		<View
			className={cn(
				"w-full flex-col items-start justify-start gap-3",
				className,
			)}
		>
			<Text
				className={cn(
					"font-semibold text-lg leading-7 text-text-strong",
					titleClassName,
				)}
			>
				{title}
			</Text>
			<View className="w-full flex-col items-start justify-start">
				{children}
			</View>
		</View>
	);
}
