import { Button, View } from "react-native";
import {
	FREQUENCY_TYPES,
	type FrequencyType,
} from "@/constants/frequencyTypes";

type FrequencyTypeSelectorProps = {
	value: FrequencyType;
	onChange: (value: FrequencyType) => void;
	disabled?: boolean;
};

export function FrequencyTypeSelector({
	value,
	onChange,
	disabled,
}: FrequencyTypeSelectorProps) {
	return (
		<View className="flex-row gap-4 mb-2">
			<Button
				title="Interval"
				color={value === FREQUENCY_TYPES.INTERVAL ? "#007AFF" : "gray"}
				onPress={() => onChange(FREQUENCY_TYPES.INTERVAL)}
				disabled={disabled}
			/>
			<Button
				title="Weekly"
				color={value === FREQUENCY_TYPES.WEEKLY ? "#007AFF" : "gray"}
				onPress={() => onChange(FREQUENCY_TYPES.WEEKLY)}
				disabled={disabled}
			/>
		</View>
	);
}
