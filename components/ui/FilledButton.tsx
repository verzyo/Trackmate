import { Pressable, type PressableProps, Text } from "react-native";
import { cn } from "@/utils/cn";

type FilledButtonVariant = "primary" | "danger" | "muted";

type FilledButtonProps = Omit<PressableProps, "children"> & {
	label: string;
	variant?: FilledButtonVariant;
	withShadow?: boolean;
	className?: string;
	labelClassName?: string;
};

export function FilledButton({
	label,
	variant = "primary",
	withShadow = true,
	className,
	labelClassName,
	disabled,
	...props
}: FilledButtonProps) {
	const variantClasses = {
		primary: "bg-action-primary",
		danger: "bg-state-danger",
		muted: "bg-state-muted-bg border border-border",
	};

	const shadowClasses = {
		primary: "shadow-lg shadow-action-primary/30",
		danger: "shadow-lg shadow-state-danger/30",
		muted: "",
	};

	const textClasses = {
		primary: "text-white",
		danger: "text-white",
		muted: "text-text-strong",
	};

	return (
		<Pressable
			{...props}
			disabled={disabled}
			className={cn(
				"h-16 w-full items-center justify-center rounded-full",
				variantClasses[variant],
				withShadow && shadowClasses[variant],
				disabled && "opacity-50",
				className,
			)}
		>
			<Text
				className={cn("text-lg font-bold", textClasses[variant], labelClassName)}
			>
				{label}
			</Text>
		</Pressable>
	);
}

export default FilledButton;
