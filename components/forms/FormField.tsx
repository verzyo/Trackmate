import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
} from "react-hook-form";
import { Text, TextInput, type TextInputProps, View } from "react-native";

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
	return (
		<View className="mb-4 w-full">
			{label && <Text className="mb-1">{label}</Text>}
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, value } }) => (
					<TextInput
						value={value as string}
						onChangeText={onChange}
						className={className}
						{...props}
					/>
				)}
			/>
			{error && <Text className="text-red-500 mt-1">{error}</Text>}
		</View>
	);
}
