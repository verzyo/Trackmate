import { memo } from "react";
import { Text, View } from "react-native";
import { dayNumberToName } from "@/constants/days";
import { FREQUENCY_TYPES } from "@/constants/frequencyTypes";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { formatToISODate } from "@/utils/date.utils";
import { DynamicIcon } from "@/utils/icons";

type GoalDetailsProps = {
	goal: GoalWithParticipant;
	isParticipant: boolean;
	streak?: number;
	streakLoading?: boolean;
	monthlyPoints?: number | null;
	pointsLoading?: boolean;
	iconName?: string;
	color?: string;
};

function hexToRgba(hex: string, alpha: number): string {
	const h = hex.replace("#", "");
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

export const GoalDetails = memo(function GoalDetails({
	goal,
	isParticipant,
	streak,
	streakLoading,
	monthlyPoints,
	pointsLoading,
	iconName = "Target",
	color = "#4f46e5",
}: GoalDetailsProps) {
	const iconBg = hexToRgba(color, 0.15);

	return (
		<View className="w-full gap-8 items-center">
			{/* Centered Header with Icon and Title */}
			<View className="items-center gap-4">
				<View
					className="h-24 w-24 items-center justify-center rounded-3xl shadow-sm"
					style={{ backgroundColor: iconBg }}
				>
					<DynamicIcon name={iconName} color={color} size={48} weight="fill" />
				</View>
				<Text className="text-3xl font-bold text-center text-text-strong px-4">
					{goal.title}
				</Text>
			</View>

			<View className="w-full gap-6">
				{/* Description */}
				{goal.description && (
					<View className="items-center gap-2">
						<Text className="text-sm font-bold uppercase tracking-widest text-text-light">
							Description
						</Text>
						<Text className="text-lg text-center leading-6 text-text-default px-6">
							{goal.description}
						</Text>
					</View>
				)}

				{/* Frequency Info */}
				<View className="items-center gap-2">
					<Text className="text-sm font-bold uppercase tracking-widest text-text-light">
						Frequency
					</Text>
					<Text className="text-xl text-center text-text-strong font-medium capitalize">
						{goal.frequency_type}
						{goal.frequency_type === FREQUENCY_TYPES.INTERVAL &&
							` • Each ${goal.frequency_value} days`}
						{goal.frequency_type === FREQUENCY_TYPES.WEEKLY &&
							` • ${goal.frequency_value} times / week`}
					</Text>
				</View>

				{/* Schedule Info */}
				<View className="items-center gap-2">
					<Text className="text-sm font-bold uppercase tracking-widest text-text-light">
						Schedule
					</Text>
					<View className="items-center gap-1">
						{goal.start_date && (
							<Text className="text-base text-text-default">
								Started {formatToISODate(new Date(goal.start_date))}
							</Text>
						)}
						{goal.frequency_type === FREQUENCY_TYPES.WEEKLY &&
							goal.weekly_days && (
								<Text className="text-base text-text-strong font-bold">
									{goal.weekly_days.map(dayNumberToName).join(", ")}
								</Text>
							)}
					</View>
				</View>
			</View>

			{isParticipant && (
				<View className="mt-2 items-center bg-state-muted-bg p-6 rounded-3xl w-full">
					<Text className="text-sm font-bold uppercase tracking-widest text-text-light mb-4">
						Your Progress
					</Text>
					<View className="flex-row w-full justify-around">
						{!streakLoading && streak !== undefined && (
							<View className="items-center">
								<Text className="text-2xl font-bold text-text-strong">
									{streak}
								</Text>
								<Text className="text-xs text-text-light">Streak</Text>
							</View>
						)}

						{!pointsLoading && (
							<View className="items-center">
								<Text className="text-2xl font-bold text-text-strong">
									{monthlyPoints ?? 0}
								</Text>
								<Text className="text-xs text-text-light">Monthly Pts</Text>
							</View>
						)}
					</View>
				</View>
			)}
		</View>
	);
});
