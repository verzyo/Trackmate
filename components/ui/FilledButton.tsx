import { Pressable, type PressableProps, Text } from "react-native";
import { cn } from "@/utils/cn";

type FilledButtonVariant = "primary" | "danger";

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
	return (
		<Pressable
			{...props}
			disabled={disabled}
			className={cn(
				"h-16 w-full items-center justify-center rounded-full",
				variant === "primary" ? "bg-action-primary" : "bg-state-danger",
				withShadow &&
					(variant === "primary"
						? "shadow-lg shadow-action-primary/30"
						: "shadow-lg shadow-state-danger/30"),
				disabled && "opacity-50",
				className,
			)}
		>
			<Text className={cn("text-lg font-bold text-white", labelClassName)}>
				{label}
			</Text>
		</Pressable>
	);
}

export default FilledButton;
