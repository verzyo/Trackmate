import { Platform, Text, View } from "react-native";
import {
	FREQUENCY_TYPES,
	type FrequencyType,
} from "@/constants/frequencyTypes";
import { useThemeColors } from "@/hooks/common/useThemeColors";

const DAY_COLUMNS = [
	{ label: "M", value: 1 },
	{ label: "T", value: 2 },
	{ label: "W", value: 3 },
	{ label: "T", value: 4 },
	{ label: "F", value: 5 },
	{ label: "S", value: 6 },
	{ label: "S", value: 0 },
];

type HeatmapCellState = "completed" | "missed" | "upcoming" | "unscheduled";

type GoalConsistencyHeatmapProps = {
	completedDates: string[];
	frequencyType: FrequencyType;
	frequencyValue: number;
	startDate?: string | null;
	weeklyDays?: number[] | null;
};

function formatDate(date: Date) {
	return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number) {
	const next = new Date(date);
	next.setUTCDate(next.getUTCDate() + days);
	return next;
}

function getWeekStart(date: Date) {
	const next = new Date(date);
	const day = next.getUTCDay();
	const diff = day === 0 ? 6 : day - 1;
	next.setUTCDate(next.getUTCDate() - diff);
	return next;
}

function normalizeDate(date: Date) {
	return new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
}

function isScheduledDay({
	date,
	frequencyType,
	frequencyValue,
	startDate,
	weeklyDays,
}: {
	date: Date;
	frequencyType: FrequencyType;
	frequencyValue: number;
	startDate: Date | null;
	weeklyDays: number[];
}) {
	if (startDate && date.getTime() < startDate.getTime()) {
		return false;
	}

	if (frequencyType === FREQUENCY_TYPES.WEEKLY) {
		const backendDay = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
		return weeklyDays.includes(backendDay);
	}

	if (!startDate) {
		return false;
	}

	const diffInDays = Math.floor(
		(date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
	);

	return diffInDays >= 0 && diffInDays % frequencyValue === 0;
}

function getCellState({
	date,
	today,
	completedSet,
	frequencyType,
	frequencyValue,
	startDate,
	weeklyDays,
}: {
	date: Date;
	today: Date;
	completedSet: Set<string>;
	frequencyType: FrequencyType;
	frequencyValue: number;
	startDate: Date | null;
	weeklyDays: number[];
}): HeatmapCellState {
	const dateKey = formatDate(date);

	if (completedSet.has(dateKey)) {
		return "completed";
	}

	const scheduled = isScheduledDay({
		date,
		frequencyType,
		frequencyValue,
		startDate,
		weeklyDays,
	});

	if (!scheduled) {
		return "unscheduled";
	}

	if (date.getTime() >= today.getTime()) {
		return "upcoming";
	}

	return "missed";
}

function HeatmapCell({
	state,
	isToday,
}: {
	state: HeatmapCellState;
	isToday?: boolean;
}) {
	const colors = useThemeColors();

	const backgroundColor =
		state === "completed"
			? colors.actionPrimary
			: state === "missed"
				? colors.danger
				: state === "upcoming"
					? colors.border
					: "transparent";

	return (
		<View
			className="aspect-square flex-1 rounded-xl"
			style={{ backgroundColor }}
		>
			{isToday && (
				<View
					className="absolute inset-0 rounded-xl"
					style={{
						borderWidth: 2,
						borderColor: colors.textDefault,
					}}
				/>
			)}
			{state === "unscheduled" && !isToday && (
				<View
					className="absolute inset-0 rounded-xl"
					style={{
						borderWidth: 1.5,
						borderColor: colors.border,
						borderStyle: "dashed",
					}}
				/>
			)}
		</View>
	);
}

export function GoalConsistencyHeatmap({
	completedDates,
	frequencyType,
	frequencyValue,
	startDate,
	weeklyDays,
}: GoalConsistencyHeatmapProps) {
	const colors = useThemeColors();
	const heatmapContentMaxWidth = 320;
	const today = normalizeDate(new Date());
	const gridStart = addDays(getWeekStart(today), -21);
	const normalizedStartDate = startDate
		? normalizeDate(new Date(startDate))
		: null;
	const scheduledDays = weeklyDays ?? [];
	const completedSet = new Set(completedDates);

	const rows = Array.from({ length: 4 }, (_, rowIndex) =>
		Array.from({ length: 7 }, (_, colIndex) =>
			addDays(gridStart, rowIndex * 7 + colIndex),
		),
	);

	return (
		<View
			className="w-full rounded-[32px] border border-border bg-surface-fg p-6"
			style={{ minHeight: Platform.OS === "web" ? 360 : undefined }}
		>
			<View className="mb-4 flex-row items-center justify-between">
				<Text
					className="text-xl font-bold text-text-strong"
					style={{ color: colors.textStrong }}
				>
					Consistency
				</Text>
				<Text
					className="text-sm font-medium text-text-light"
					style={{ color: colors.textLight }}
				>
					Last 28 Days
				</Text>
			</View>

			<View
				className="w-full self-center"
				style={{ maxWidth: heatmapContentMaxWidth }}
			>
				<View className="mb-3 flex-row gap-2">
					{DAY_COLUMNS.map((day) => (
						<View key={day.value} className="flex-1 items-center">
							<Text
								className="text-sm font-medium text-text-light"
								style={{ color: colors.textLight }}
							>
								{day.label}
							</Text>
						</View>
					))}
				</View>

				<View className="gap-2">
					{rows.map((week) => (
						<View
							key={`week-${formatDate(week[0])}`}
							className="flex-row gap-2"
						>
							{week.map((date) => (
								<View key={formatDate(date)} className="aspect-square flex-1">
									<HeatmapCell
										isToday={date.getTime() === today.getTime()}
										state={getCellState({
											date,
											today,
											completedSet,
											frequencyType,
											frequencyValue,
											startDate: normalizedStartDate,
											weeklyDays: scheduledDays,
										})}
									/>
								</View>
							))}
						</View>
					))}
				</View>
			</View>
		</View>
	);
}
