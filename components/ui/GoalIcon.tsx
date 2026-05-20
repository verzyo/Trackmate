import { PencilSimple } from "phosphor-react-native";
import { Pressable, View } from "react-native";
import { cn } from "@/utils/cn";
import { hexToRgba } from "@/utils/color.utils";
import { DynamicIcon } from "@/utils/icons";

type GoalIconProps = {
	icon: string;
	color: string;
	size?: number;
	variant?: "static" | "dashed" | "interactive";
	onPress?: () => void;
	containerClassName?: string;
};

export function GoalIcon({
	icon,
	color,
	size = 64,
	variant = "static",
	onPress,
	containerClassName,
}: GoalIconProps) {
	const iconBg = hexToRgba(color, 0.15);
	const isInteractive = variant === "interactive" || variant === "dashed";
	const isDashed = variant === "dashed";

	const content = (
		<View
			className={cn(
				"items-center justify-center",
				isDashed && "border-2 border-dashed",
				containerClassName,
			)}
			style={{
				width: size * 2,
				height: size * 2,
				borderRadius: size * 0.5,
				backgroundColor: iconBg,
				borderColor: isDashed ? color : "transparent",
			}}
		>
			<DynamicIcon name={icon} size={size} color={color} weight="fill" />

			{isInteractive && (
				<View
					className="absolute -right-1 -bottom-1 items-center justify-center rounded-full bg-action-primary border-4 border-surface-bg"
					style={{
						width: size * 0.68,
						height: size * 0.68,
					}}
				>
					<PencilSimple size={size * 0.31} color="white" weight="bold" />
				</View>
			)}
		</View>
	);

	if (onPress) {
		return <Pressable onPress={onPress}>{content}</Pressable>;
	}

	return content;
}

export default GoalIcon;
