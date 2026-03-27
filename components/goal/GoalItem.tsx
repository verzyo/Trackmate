import { Flag, Target } from "phosphor-react-native";
import { memo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ATTACHMENT_TYPES } from "@/constants/attachmentTypes";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { cn } from "@/utils/cn";

type GoalItemProps = {
	goal: GoalWithParticipant;
	subtitle?: string;
	canComplete?: boolean;
	isCompleted?: boolean;
	isPending?: boolean;
	onToggle?: () => void;
	onPress?: () => void;
	icon?: string | null;
	color?: string | null;
};

const getIcon = (iconName: string, color: string, size: number) => {
	switch (iconName) {
		case "Flag":
			return <Flag size={size} color={color} weight="fill" />;
		case "Target":
			return <Target size={size} color={color} weight="fill" />;
		default:
			return <Flag size={size} color={color} weight="fill" />;
	}
};

export const GoalItem = memo(function GoalItem({
	goal,
	subtitle,
	canComplete,
	isCompleted,
	isPending,
	onToggle,
	onPress,
	icon,
	color,
}: GoalItemProps) {
	return (
		<View className="flex-row items-center border-b border-neutral-200 w-full">
			<Pressable
				className="flex-1 py-3 flex-row items-center gap-3"
				onPress={onPress}
			>
				{getIcon(icon || "Flag", color || "#3b82f6", 24)}
				<View className="flex-1 justify-center">
					<Text
						className={cn(
							"text-lg",
							isCompleted
								? "text-neutral-400 line-through"
								: "text-neutral-800",
						)}
					>
						{goal.title}
					</Text>
					{subtitle && (
						<Text className="text-sm text-neutral-500">{subtitle}</Text>
					)}
				</View>
			</Pressable>

			{canComplete && (
				<Pressable onPress={onToggle} disabled={isPending} className="p-3">
					{isPending ? (
						<ActivityIndicator size="small" color="#000" />
					) : (
						<View className="flex-row items-center gap-2">
							{!isCompleted &&
								goal.attachment_type !== ATTACHMENT_TYPES.NONE &&
								goal.require_attachment && (
									<Text className="text-[10px] text-blue-500 uppercase font-bold">
										Proof
									</Text>
								)}
							<View
								className={cn(
									"w-7 h-7 rounded-full border-2 border-black items-center justify-center",
									isCompleted ? "bg-black" : "bg-transparent",
								)}
							>
								{isCompleted && (
									<Text className="text-white text-xs font-bold">✓</Text>
								)}
							</View>
						</View>
					)}
				</Pressable>
			)}
		</View>
	);
});
