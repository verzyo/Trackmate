import { ArrowsClockwise } from "phosphor-react-native";
import { Text, View } from "react-native";
import {
	FREQUENCY_TYPES,
	type FrequencyType,
} from "@/constants/frequencyTypes";
import { useThemeColors } from "@/hooks/common/useThemeColors";
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

type GoalFrequencyCardProps = {
	frequencyType: FrequencyType;
	frequencyValue: number;
	weeklyDays?: number[] | null;
};

export function GoalFrequencyCard({
	frequencyType,
	frequencyValue,
	weeklyDays,
}: GoalFrequencyCardProps) {
	const colors = useThemeColors();
	const scheduledDays = weeklyDays ?? [];

	if (frequencyType === FREQUENCY_TYPES.WEEKLY && scheduledDays.length > 0) {
		return (
			<View className="w-full rounded-[32px] border border-border bg-surface-fg p-5">
				<Text
					className="mb-4 text-2xl font-bold text-text-strong"
					style={{ color: colors.textStrong }}
				>
					Frequency
				</Text>

				<View className="flex-row items-center justify-between">
					{WEEK_DAYS.map((day) => {
						const active = scheduledDays.includes(day.value);

						return (
							<View
								key={day.value}
								className={cn(
									"h-11 w-11 items-center justify-center rounded-full",
									active ? "bg-action-primary" : "bg-state-muted-bg",
								)}
							>
								<Text
									className="text-base font-bold"
									style={{
										color: active ? "#ffffff" : colors.textLight,
									}}
								>
									{day.label}
								</Text>
							</View>
						);
					})}
				</View>
			</View>
		);
	}

	const label =
		frequencyValue === 1 ? "Every day" : `Every ${frequencyValue} days`;

	return (
		<View className="w-full flex-row items-center justify-between rounded-full border border-border bg-surface-fg px-5 py-6">
			<Text
				className="text-2xl font-bold text-text-strong"
				style={{ color: colors.textStrong }}
			>
				Frequency
			</Text>

			<View className="flex-row items-center gap-2">
				<ArrowsClockwise size={24} color={colors.actionPrimary} weight="bold" />
				<Text
					className="text-xl font-medium"
					style={{ color: colors.actionPrimary }}
				>
					{label}
				</Text>
			</View>
		</View>
	);
}
