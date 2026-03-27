import { memo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ATTACHMENT_TYPES } from "@/constants/attachmentTypes";
import type { GoalWithParticipant } from "@/schemas/goal.schema";

type GoalItemProps = {
	goal: GoalWithParticipant;
	subtitle?: string;
	canComplete?: boolean;
	isCompleted?: boolean;
	isPending?: boolean;
	onToggle?: () => void;
	onPress?: () => void;
};

export const GoalItem = memo(function GoalItem({
	goal,
	subtitle,
	canComplete,
	isCompleted,
	isPending,
	onToggle,
	onPress,
}: GoalItemProps) {
	return (
		<View className="flex-row items-center border-b border-neutral-200 w-full">
			<Pressable className="flex-1 py-3 justify-center" onPress={onPress}>
				<Text
					className={`text-lg ${
						isCompleted ? "text-neutral-400 line-through" : "text-neutral-800"
					}`}
				>
					{goal.title}
				</Text>
				{subtitle && (
					<Text className="text-sm text-neutral-500">{subtitle}</Text>
				)}
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
								className={`w-7 h-7 rounded-full border-2 border-black items-center justify-center ${
									isCompleted ? "bg-black" : "bg-transparent"
								}`}
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
