import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { cn } from "@/utils/cn";

type TagVariant =
	| "default"
	| "success"
	| "warning"
	| "danger"
	| "info"
	| "streak"
	| "personal";

interface TagProps {
	label: string;
	icon?: ReactNode;
	variant?: TagVariant;
	className?: string;
	labelClassName?: string;
}

export function Tag({
	label,
	icon,
	variant = "default",
	className,
	labelClassName,
}: TagProps) {
	const variants: Record<TagVariant, { container: string; text: string }> = {
		default: {
			container: "bg-label-bg",
			text: "text-label-fg",
		},
		success: {
			container: "bg-green-100",
			text: "text-green-700",
		},
		warning: {
			container: "bg-yellow-100",
			text: "text-yellow-700",
		},
		danger: {
			container: "bg-red-100",
			text: "text-red-700",
		},
		info: {
			container: "bg-blue-100",
			text: "text-blue-700",
		},
		streak: {
			container: "bg-orange-100",
			text: "text-orange-600",
		},
		personal: {
			container: "bg-label-bg",
			text: "text-label-fg",
		},
	};

	const currentVariant = variants[variant];

	return (
		<View
			className={cn(
				"flex-row items-center justify-center gap-1 rounded-full px-2.5 py-0.5",
				currentVariant.container,
				className,
			)}
		>
			{icon}
			<Text
				className={cn(
					"text-xs font-bold",
					variant === "personal" && "uppercase tracking-wider",
					currentVariant.text,
					labelClassName,
				)}
			>
				{label}
			</Text>
		</View>
	);
}

export default Tag;
