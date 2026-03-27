import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
	type PathValue,
	type UseFormSetValue,
} from "react-hook-form";
import { Button, Switch, Text, View } from "react-native";
import {
	ATTACHMENT_TYPES,
	type AttachmentType,
} from "@/constants/attachmentTypes";

type AttachmentTypeSelectorProps<T extends FieldValues> = {
	control: Control<T>;
	nameType: Path<T>;
	nameRequire: Path<T>;
	setValue: UseFormSetValue<T>;
	watchedType: AttachmentType;
};

export function AttachmentTypeSelector<T extends FieldValues>({
	control,
	nameType,
	nameRequire,
	setValue,
	watchedType,
}: AttachmentTypeSelectorProps<T>) {
	return (
		<View className="w-full">
			<Controller
				control={control}
				name={nameType}
				render={({ field: { onChange, value } }) => (
					<View className="flex-row gap-4 mb-2 justify-center">
						{Object.values(ATTACHMENT_TYPES).map((type) => (
							<Button
								key={type}
								title={type}
								color={value === type ? "#007AFF" : "gray"}
								onPress={() => {
									onChange(type);
									if (type === ATTACHMENT_TYPES.NONE) {
										setValue(nameRequire, false as PathValue<T, Path<T>>);
									}
								}}
							/>
						))}
					</View>
				)}
			/>

			{watchedType !== ATTACHMENT_TYPES.NONE && (
				<Controller
					control={control}
					name={nameRequire}
					render={({ field: { onChange, value } }) => (
						<View className="flex-row items-center justify-center gap-2 mb-4">
							<Text>Require attachment</Text>
							<Switch value={value as boolean} onValueChange={onChange} />
						</View>
					)}
				/>
			)}
		</View>
	);
}
