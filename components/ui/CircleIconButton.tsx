import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";
import { UI_SIZES } from "@/constants/ui";
import { cn } from "@/utils/cn";

type CircleIconButtonProps = Omit<PressableProps, "children"> & {
	children: ReactNode;
	className?: string;
};

export function CircleIconButton({
	children,
	className,
	disabled,
	...props
}: CircleIconButtonProps) {
	return (
		<Pressable
			{...props}
			disabled={disabled}
			style={{ height: UI_SIZES.circleButton, width: UI_SIZES.circleButton }}
			className={cn(
				"items-center justify-center rounded-full border border-border bg-surface-fg",
				disabled && "opacity-50",
				className,
			)}
		>
			{children}
		</Pressable>
	);
}

export default CircleIconButton;
