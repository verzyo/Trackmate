import { Text, TextInput, View } from "react-native";
import { DatePicker } from "@/components/forms/DatePicker";
import { FREQUENCY_TYPES } from "@/constants/frequencyTypes";
import type { GoalWithParticipant } from "@/schemas/goal.schema";

type GoalScheduleEditorProps = {
	goal: GoalWithParticipant;
	hasCompletions: boolean;
	startDate: Date;
	onStartDateChange: (date: Date) => void;
	weeklyDaysInput: string;
	onWeeklyDaysChange: (val: string) => void;
};

export function GoalScheduleEditor({
	goal,
	hasCompletions,
	startDate,
	onStartDateChange,
	weeklyDaysInput,
	onWeeklyDaysChange,
}: GoalScheduleEditorProps) {
	return (
		<View className="w-full mb-4 items-center">
			<View className="h-[1px] bg-gray-300 w-full my-4" />

			<Text className="font-bold text-lg mb-2">Schedule</Text>

			{hasCompletions && (
				<Text className="text-amber-600 text-sm text-center px-4 mb-4">
					Schedule cannot be modified after completions have been recorded.
				</Text>
			)}

			<DatePicker
				label="Start Date"
				value={startDate}
				onChange={onStartDateChange}
				disabled={hasCompletions}
			/>

			{goal.frequency_type === FREQUENCY_TYPES.WEEKLY && (
				<View className="w-full items-center mt-2">
					<Text>Days of Week (1=Mon, 7=Sun)</Text>
					<TextInput
						value={weeklyDaysInput}
						onChangeText={onWeeklyDaysChange}
						placeholder="e.g. 1, 3, 5"
						className="text-center mt-1 w-full"
						editable={!hasCompletions}
					/>
				</View>
			)}
		</View>
	);
}
