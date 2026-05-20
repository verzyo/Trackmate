import { View } from "react-native";
import { DatePicker } from "@/components/forms/DatePicker";

type StartDatePickerProps = {
	value: Date;
	onChange: (date: Date) => void;
	disabled?: boolean;
};

export function StartDatePicker({
	value,
	onChange,
	disabled,
}: StartDatePickerProps) {
	return (
		<View className="w-full">
			<DatePicker value={value} onChange={onChange} disabled={disabled} />
		</View>
	);
}
