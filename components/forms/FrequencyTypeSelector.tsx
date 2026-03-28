import { View } from "react-native";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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
		<View className="w-full">
			<SegmentedControl
				options={[
					{ label: "Interval", value: FREQUENCY_TYPES.INTERVAL },
					{ label: "Weekly", value: FREQUENCY_TYPES.WEEKLY },
				]}
				value={value}
				onChange={onChange}
				disabled={disabled}
			/>
		</View>
	);
}
