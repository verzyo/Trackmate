import { FrequencyTypeSelector } from "@/components/forms/FrequencyTypeSelector";
import { WeekDaySelector } from "@/components/forms/WeekDaySelector";
import {
    FREQUENCY_TYPES,
    type FrequencyType,
} from "@/constants/frequencyTypes";
import { cn } from "@/utils/cn";
import * as PhosphorIcons from "phosphor-react-native";
import {
    Platform,
    Pressable,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";

type GoalFrequencyEditorProps = {
	frequencyType: FrequencyType;
	onFrequencyTypeChange: (val: FrequencyType) => void;
	intervalValue: number;
	intervalInputValue: string;
	onIntervalChange: (value: string) => void;
	onIntervalBlur: () => void;
	onIncrementInterval: () => void;
	onDecrementInterval: () => void;
	scheduledDays: number[];
	onToggleDay: (day: number) => void;
	weeklyDaysError?: string;
	disabled?: boolean;
	textStrongColor: string;
	textLightColor: string;
	textDefaultColor: string;
	actionPrimaryColor: string;
};

export function GoalFrequencyEditor({
	frequencyType,
	onFrequencyTypeChange,
	intervalValue,
	intervalInputValue,
	onIntervalChange,
	onIntervalBlur,
	onIncrementInterval,
	onDecrementInterval,
	scheduledDays,
	onToggleDay,
	weeklyDaysError,
	disabled,
	textStrongColor,
	textLightColor,
	textDefaultColor,
	actionPrimaryColor,
}: GoalFrequencyEditorProps) {
	const { width } = useWindowDimensions();
	const useCompactIntervalLayout = Platform.OS === "web" && width < 560;

	return (
		<>
			<FrequencyTypeSelector
				value={frequencyType}
				onChange={onFrequencyTypeChange}
				disabled={disabled}
			/>

			<View
				className={cn(
					"bg-surface-fg p-5 border border-border",
					frequencyType === FREQUENCY_TYPES.WEEKLY
						? "rounded-[32px]"
						: "rounded-3xl",
					weeklyDaysError &&
						frequencyType === FREQUENCY_TYPES.WEEKLY &&
						"border-state-danger",
					disabled && "opacity-50",
				)}
			>
				{frequencyType === FREQUENCY_TYPES.INTERVAL ? (
					<View
						className={cn(
							"gap-4",
							useCompactIntervalLayout
								? "items-stretch"
								: "flex-row items-center justify-between",
						)}
					>
						<View
							className={cn("gap-1", !useCompactIntervalLayout && "flex-1")}
						>
							<Text
								className="font-bold text-text-strong text-base"
								style={{ color: textStrongColor }}
							>
								{intervalValue === 1
									? "Every day"
									: intervalValue === 2
										? "Every other day"
										: `Every ${intervalValue} days`}
							</Text>
							<Text
								className="text-text-light text-xs"
								style={{ color: textLightColor }}
							>
								Recurring gap between logs
							</Text>
						</View>
						<View
							className={cn(
								"flex-row items-center rounded-full bg-state-muted-bg p-1 gap-2",
							)}
							style={useCompactIntervalLayout ? { width: "100%" } : undefined}
						>
							<Pressable
								disabled={intervalValue <= 1 || disabled}
								onPress={onDecrementInterval}
								className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-fg disabled:bg-state-muted-bg"
							>
								<PhosphorIcons.Minus
									size={16}
									color={
										intervalValue <= 1 || disabled
											? textLightColor
											: actionPrimaryColor
									}
									weight="bold"
								/>
							</Pressable>
							<TextInput
								value={intervalInputValue}
								onChangeText={onIntervalChange}
								onBlur={onIntervalBlur}
								keyboardType="number-pad"
								textAlign="center"
								selectTextOnFocus
								editable={!disabled}
								className={cn(
									"h-10 rounded-full px-3 text-center text-lg font-bold text-text-strong",
									useCompactIntervalLayout ? "min-w-0 flex-1" : "w-14",
								)}
								style={{
									color: textStrongColor,
									paddingVertical: 0,
									minWidth: useCompactIntervalLayout ? 0 : undefined,
									lineHeight: 24,
								}}
							/>
							<Pressable
								disabled={disabled}
								onPress={onIncrementInterval}
								className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-fg disabled:bg-state-muted-bg"
							>
								<PhosphorIcons.Plus
									size={16}
									color={disabled ? textLightColor : actionPrimaryColor}
									weight="bold"
								/>
							</Pressable>
						</View>
					</View>
				) : (
					<View className="gap-5">
						<WeekDaySelector
							selectedDays={scheduledDays}
							onToggleDay={onToggleDay}
							disabled={disabled}
							textColor={textDefaultColor}
						/>
					</View>
				)}
			</View>
			{weeklyDaysError && frequencyType === FREQUENCY_TYPES.WEEKLY && (
				<Text className="text-state-danger text-sm font-medium mt-1 ml-1">
					{weeklyDaysError}
				</Text>
			)}
		</>
	);
}
