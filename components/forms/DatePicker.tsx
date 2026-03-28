import NativeDateTimePicker, {
	type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { CalendarBlank } from "phosphor-react-native";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useThemeColors } from "@/hooks/common/useThemeColors";
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
	const colors = useThemeColors();
	const [show, setShow] = useState(false);

	const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
		if (Platform.OS === "android") {
			setShow(false);
		}
		if (selectedDate) onChange(toUTCMidnight(selectedDate));
	};

	return (
		<View className="mb-4 w-full gap-2">
			{label && (
				<Text className="font-semibold text-base text-text-strong">
					{label}
				</Text>
			)}

			{Platform.OS === "web" ? (
				<View className="w-full h-14 rounded-full border border-border bg-surface-fg px-5 flex-row items-center justify-between">
					<input
						type="date"
						value={formatToISODate(value)}
						disabled={disabled}
						onChange={(e) => {
							if (e.target.value) {
								const [year, month, day] = e.target.value
									.split("-")
									.map(Number);
								onChange(new Date(Date.UTC(year, month - 1, day)));
							}
						}}
						style={{
							border: "none",
							outline: "none",
							background: "transparent",
							flex: 1,
							color: "var(--color-text-strong)",
							fontSize: "16px",
						}}
					/>
					<CalendarBlank size={20} color={colors.textLight} weight="bold" />
				</View>
			) : (
				<Pressable
					onPress={() => !disabled && setShow(true)}
					disabled={disabled}
					className={cn(
						"w-full h-14 rounded-full border border-border bg-surface-fg px-5 flex-row items-center justify-between",
						disabled && "opacity-50",
					)}
				>
					<Text className="text-base text-text-strong">
						{value.toLocaleDateString()}
					</Text>
					<CalendarBlank size={20} color={colors.textLight} weight="bold" />
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
