import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
} from "react-hook-form";
import { Switch } from "@/components/goal/fields/Switch";
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
		<Controller
			control={control}
			name={nameType}
			render={({ field: { onChange, value } }) => (
				<Switch
					options={options}
					value={value}
					onChange={onChange}
					disabled={disabled}
				/>
			)}
		/>
	);
}
