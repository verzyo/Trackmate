import NativeDateTimePicker, {
	type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { cn } from "@/utils/cn";
import { formatToISODate, toUTCMidnight } from "@/utils/date.utils";

type DatePickerProps = {
	value: Date;
	onChange: (date: Date) => void;
	disabled?: boolean;
	label?: string;
};

export function DatePicker({
	value,
	onChange,
	disabled,
	label,
}: DatePickerProps) {
	const [show, setShow] = useState(false);

	const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
		if (Platform.OS === "android") {
			setShow(false);
		}
		if (selectedDate) onChange(toUTCMidnight(selectedDate));
	};

	return (
		<View className="mb-4 w-full items-center">
			{label && <Text className="mb-1">{label}</Text>}

			{Platform.OS === "web" ? (
				<input
					type="date"
					value={formatToISODate(value)}
					disabled={disabled}
					onChange={(e) => {
						if (e.target.value) {
							const [year, month, day] = e.target.value.split("-").map(Number);
							onChange(new Date(Date.UTC(year, month - 1, day)));
						}
					}}
					className="border-0 outline-none bg-transparent text-center"
				/>
			) : (
				<Pressable
					onPress={() => !disabled && setShow(true)}
					className="p-3"
					disabled={disabled}
				>
					<Text
						className={cn(
							"text-center",
							disabled ? "text-neutral-400" : "text-blue-500",
						)}
					>
						{value.toLocaleDateString()}
					</Text>
				</Pressable>
			)}

			{Platform.OS !== "web" && show && (
				<NativeDateTimePicker
					value={value}
					mode="date"
					display="default"
					onChange={handleChange}
				/>
			)}
		</View>
	);
}
