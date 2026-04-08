import NativeDateTimePicker, {
	type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { CalendarBlank } from "phosphor-react-native";
import { useRef, useState } from "react";
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
	const webDateInputRef = useRef<HTMLInputElement>(null);

	const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
		if (Platform.OS === "android") {
			setShow(false);
		}
		if (selectedDate) onChange(toUTCMidnight(selectedDate));
	};

	const openWebDatePicker = () => {
		if (disabled) return;

		const input = webDateInputRef.current;
		if (!input) return;

		const pickerInput = input as HTMLInputElement & {
			showPicker?: () => void;
		};

		if (typeof pickerInput.showPicker === "function") {
			pickerInput.showPicker();
			return;
		}

		pickerInput.focus();
		pickerInput.click();
	};

	return (
		<View className="mb-4 w-full gap-2">
			{label && (
				<Text className="font-semibold text-base text-text-strong">
					{label}
				</Text>
			)}

			{Platform.OS === "web" ? (
				<Pressable
					onPress={openWebDatePicker}
					disabled={disabled}
					className={cn(
						"relative w-full h-14 rounded-full border border-border bg-surface-fg px-5 flex-row items-center justify-between overflow-hidden",
						disabled && "opacity-50",
					)}
				>
					<input
						ref={webDateInputRef}
						type="date"
						value={formatToISODate(value)}
						disabled={disabled}
						aria-label={label || "Select date"}
						onChange={(e) => {
							if (e.target.value) {
								const [year, month, day] = e.target.value
									.split("-")
									.map(Number);
								onChange(new Date(Date.UTC(year, month - 1, day)));
							}
						}}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							height: 1,
							width: 1,
							border: "none",
							outline: "none",
							background: "transparent",
							opacity: 0,
							pointerEvents: "none",
							cursor: disabled ? "not-allowed" : "pointer",
							WebkitAppearance: "none",
							MozAppearance: "none",
							appearance: "none",
						}}
					/>
					<Text className="text-base text-text-strong">
						{value.toLocaleDateString(undefined, {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
						})}
					</Text>
					<View className="pointer-events-none">
						<CalendarBlank size={20} color={colors.textLight} weight="bold" />
					</View>
				</Pressable>
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
