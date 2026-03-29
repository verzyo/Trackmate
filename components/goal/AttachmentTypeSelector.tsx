import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
} from "react-hook-form";
import { View } from "react-native";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
	ATTACHMENT_TYPES,
	type AttachmentType,
} from "@/constants/attachmentTypes";

type AttachmentTypeSelectorProps<T extends FieldValues> = {
	control: Control<T>;
	nameType: Path<T>;
	disabled?: boolean;
};

export function AttachmentTypeSelector<T extends FieldValues>({
	control,
	nameType,
	disabled,
}: AttachmentTypeSelectorProps<T>) {
	const options: { label: string; value: AttachmentType }[] = [
		{ label: "None", value: ATTACHMENT_TYPES.NONE },
		{ label: "Photo", value: ATTACHMENT_TYPES.PHOTO },
		{ label: "Text", value: ATTACHMENT_TYPES.TEXT },
		{ label: "URL", value: ATTACHMENT_TYPES.URL },
	];

	return (
		<View className="w-full gap-4">
			<Controller
				control={control}
				name={nameType}
				render={({ field: { onChange, value } }) => (
					<SegmentedControl
						options={options}
						value={value}
						onChange={(val) => {
							onChange(val);
						}}
						disabled={disabled}
					/>
				)}
			/>
		</View>
	);
}
