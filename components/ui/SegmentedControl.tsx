import { Pressable, Text, View } from "react-native";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { cn } from "@/utils/cn";

type SegmentedControlProps<T extends string> = {
	options: { label: string; value: T }[];
	value: T;
	onChange: (value: T) => void;
	disabled?: boolean;
	className?: string;
};

export function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
	disabled,
	className,
}: SegmentedControlProps<T>) {
	const colors = useThemeColors();

	return (
		<View
			className={cn(
				"flex-row rounded-full bg-state-muted-bg p-1 h-14 items-center",
				className,
			)}
		>
			{options.map((option) => {
				const isActive = value === option.value;
				return (
					<Pressable
						key={option.value}
						disabled={disabled}
						onPress={() => onChange(option.value)}
						className="flex-1 h-full items-center justify-center rounded-full"
						style={{
							backgroundColor: isActive ? colors.surfaceBg : "transparent",
						}}
					>
						<Text
							className={cn(
								"font-bold text-base",
								isActive ? "text-action-primary" : "text-text-default",
							)}
							style={{
								color: isActive ? colors.actionPrimary : colors.textDefault,
							}}
						>
							{option.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}
