import { Pressable, Text, View } from "react-native";
import { cn } from "@/utils/cn";

const WEEK_DAYS = [
	{ label: "M", value: 1 },
	{ label: "T", value: 2 },
	{ label: "W", value: 3 },
	{ label: "T", value: 4 },
	{ label: "F", value: 5 },
	{ label: "S", value: 6 },
	{ label: "S", value: 0 },
];

type WeekDaySelectorProps = {
	selectedDays: number[];
	onToggleDay: (day: number) => void;
	disabled?: boolean;
	textColor: string;
};

export function WeekDaySelector({
	selectedDays,
	onToggleDay,
	disabled,
	textColor,
}: WeekDaySelectorProps) {
	return (
		<View className="flex-row gap-3 justify-center rounded-full">
			{WEEK_DAYS.map((day) => {
				const isSelected = selectedDays.includes(day.value);
				return (
					<Pressable
						key={day.value}
						disabled={disabled}
						onPress={() => onToggleDay(day.value)}
						className={cn(
							"h-10 w-10 rounded-full items-center justify-center",
							isSelected ? "bg-action-primary" : "bg-state-muted-bg",
						)}
					>
						<Text
							className="font-bold"
							style={{ color: isSelected ? "white" : textColor }}
						>
							{day.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}
