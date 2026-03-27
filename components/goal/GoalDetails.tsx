import { memo } from "react";
import { Text, View } from "react-native";
import { dayNumberToName } from "@/constants/days";
import { FREQUENCY_TYPES } from "@/constants/frequencyTypes";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { formatToISODate } from "@/utils/date.utils";

type GoalDetailsProps = {
	goal: GoalWithParticipant;
	isParticipant: boolean;
	streak?: number;
	streakLoading?: boolean;
	monthlyPoints?: number | null;
	pointsLoading?: boolean;
};

export const GoalDetails = memo(function GoalDetails({
	goal,
	isParticipant,
	streak,
	streakLoading,
	monthlyPoints,
	pointsLoading,
}: GoalDetailsProps) {
	return (
		<View className="w-full items-center gap-2">
			<Text className="text-xl font-bold">Title: {goal.title}</Text>
			<Text>Description: {goal.description || "No description"}</Text>

			<Text className="font-bold mt-2">
				Frequency:{" "}
				<Text className="font-normal capitalize">{goal.frequency_type}</Text>
			</Text>
			{goal.frequency_type === FREQUENCY_TYPES.INTERVAL && (
				<Text>Every: {goal.frequency_value} days</Text>
			)}
			{goal.frequency_type === FREQUENCY_TYPES.WEEKLY && (
				<Text>Days per week: {goal.frequency_value}</Text>
			)}

			<Text className="font-bold mt-2">Schedule:</Text>
			{goal.start_date && (
				<Text>Start Date: {formatToISODate(new Date(goal.start_date))}</Text>
			)}
			{goal.frequency_type === FREQUENCY_TYPES.WEEKLY && goal.weekly_days && (
				<Text>
					Days of week: {goal.weekly_days.map(dayNumberToName).join(", ")}
				</Text>
			)}

			{isParticipant && (
				<View className="mt-4 items-center bg-neutral-100 p-4 rounded-lg w-full mb-4">
					<Text className="font-bold mb-2">Your Stats</Text>
					{!streakLoading && streak !== undefined && (
						<Text>Streak: {streak} days</Text>
					)}

					{!pointsLoading && (
						<Text>Points this month: {monthlyPoints ?? 0}</Text>
					)}
				</View>
			)}
		</View>
	);
});
