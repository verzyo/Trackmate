import {
	Platform,
	Pressable,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
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
	const { width } = useWindowDimensions();
	const compactWebLayout = Platform.OS === "web" && width < 560;
	const dayGap = Platform.OS === "web" && width < 460 ? 6 : 12;
	const estimatedAvailableWidth = Math.max(200, width - 96);
	const rawDaySize = Math.floor(
		(estimatedAvailableWidth - dayGap * (WEEK_DAYS.length - 1)) /
			WEEK_DAYS.length,
	);
	const daySize = compactWebLayout
		? Math.max(24, Math.min(40, rawDaySize))
		: 40;

	return (
		<View
			className="w-full flex-row justify-between rounded-full"
			style={{ columnGap: dayGap }}
		>
			{WEEK_DAYS.map((day) => {
				const isSelected = selectedDays.includes(day.value);
				return (
					<Pressable
						key={day.value}
						disabled={disabled}
						onPress={() => onToggleDay(day.value)}
						className={cn(
							"rounded-full items-center justify-center",
							isSelected ? "bg-action-primary" : "bg-state-muted-bg",
						)}
						style={{ width: daySize, height: daySize }}
					>
						<Text
							className="font-bold text-sm"
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
