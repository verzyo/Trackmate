import { View } from "react-native";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/utils/cn";

type SwitchProps<T extends string> = {
	options: { label: string; value: T }[];
	value: T;
	onChange: (value: T) => void;
	disabled?: boolean;
	className?: string;
};

export function Switch<T extends string>({
	options,
	value,
	onChange,
	disabled,
	className,
}: SwitchProps<T>) {
	return (
		<View className={cn("w-full", className)}>
			<SegmentedControl
				options={options}
				value={value}
				onChange={onChange}
				disabled={disabled}
			/>
		</View>
	);
}
