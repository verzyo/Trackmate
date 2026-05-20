import { FrequencySelector } from "@/components/goal/fields/FrequencySelector";
import { Switch } from "@/components/goal/fields/Switch";
import {
	FREQUENCY_TYPES,
	type FrequencyType,
} from "@/constants/frequencyTypes";

type GoalFrequencyEditorProps = {
	frequencyType: FrequencyType;
	onFrequencyTypeChange: (val: FrequencyType) => void;
	intervalValue: number;
	intervalInputValue: string;
	onIntervalChange: (value: string) => void;
	onIntervalBlur: () => void;
	onIncrementInterval: () => void;
	onDecrementInterval: () => void;
	scheduledDays: number[];
	onToggleDay: (day: number) => void;
	weeklyDaysError?: string;
	disabled?: boolean;
};

export function GoalFrequencyEditor({
	frequencyType,
	onFrequencyTypeChange,
	intervalValue,
	intervalInputValue,
	onIntervalChange,
	onIntervalBlur,
	onIncrementInterval,
	onDecrementInterval,
	scheduledDays,
	onToggleDay,
	weeklyDaysError,
	disabled,
}: GoalFrequencyEditorProps) {
	return (
		<>
			<Switch
				options={[
					{ label: "Interval", value: FREQUENCY_TYPES.INTERVAL },
					{ label: "Weekly", value: FREQUENCY_TYPES.WEEKLY },
				]}
				value={frequencyType}
				onChange={onFrequencyTypeChange}
				disabled={disabled}
			/>

			<FrequencySelector
				frequencyType={frequencyType}
				intervalValue={intervalValue}
				intervalInputValue={intervalInputValue}
				onIntervalChange={onIntervalChange}
				onIntervalBlur={onIntervalBlur}
				onIncrementInterval={onIncrementInterval}
				onDecrementInterval={onDecrementInterval}
				scheduledDays={scheduledDays}
				onToggleDay={onToggleDay}
				weeklyDaysError={weeklyDaysError}
				disabled={disabled}
			/>
		</>
	);
}
