import { Pressable, type PressableProps, Text } from "react-native";
import { cn } from "@/utils/cn";

type MutedBorderButtonProps = PressableProps & {
	label: string;
	className?: string;
	labelClassName?: string;
};

export function MutedBorderButton({
	label,
	className,
	labelClassName,
	disabled,
	...props
}: MutedBorderButtonProps) {
	return (
		<Pressable
			{...props}
			disabled={disabled}
			className={cn(
				"h-16 items-center justify-center rounded-full border border-border bg-state-muted-bg",
				disabled && "opacity-50",
				className,
			)}
		>
			<Text
				className={cn("text-lg font-bold text-text-strong", labelClassName)}
			>
				{label}
			</Text>
		</Pressable>
	);
}

export default MutedBorderButton;
