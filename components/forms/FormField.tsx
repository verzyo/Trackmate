import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
} from "react-hook-form";
import { Text, TextInput, type TextInputProps, View } from "react-native";
import { useThemeColors } from "@/hooks/common/useThemeColors";

type FormFieldProps<T extends FieldValues> = TextInputProps & {
	control: Control<T>;
	name: Path<T>;
	label?: string;
	error?: string;
};

export function FormField<T extends FieldValues>({
	control,
	name,
	label,
	error,
	className,
	...props
}: FormFieldProps<T>) {
	const colors = useThemeColors();

	return (
		<View className="mb-4 w-full gap-2">
			{label && (
				<Text className="font-semibold text-base text-text-strong">
					{label}
				</Text>
			)}
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, value, onBlur } }) => (
					<TextInput
						value={value as string}
						onChangeText={onChange}
						onBlur={onBlur}
						className={`w-full h-14 border border-border bg-surface-fg px-5 text-base text-text-strong ${
							props.multiline ? "rounded-3xl" : "rounded-full"
						} ${error ? "border-state-danger" : ""} ${className}`}
						style={{ color: colors.textStrong }}
						placeholderTextColor={colors.textLight}
						{...props}
					/>
				)}
			/>
			{error && (
				<Text className="text-state-danger text-sm font-medium mt-1 ml-1">
					{error}
				</Text>
			)}
		</View>
	);
}
