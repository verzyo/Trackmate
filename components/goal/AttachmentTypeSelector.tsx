import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
	type PathValue,
	type UseFormSetValue,
} from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
	ATTACHMENT_TYPES,
	type AttachmentType,
} from "@/constants/attachmentTypes";
import { cn } from "@/utils/cn";

type AttachmentTypeSelectorProps<T extends FieldValues> = {
	control: Control<T>;
	nameType: Path<T>;
	nameRequire: Path<T>;
	setValue: UseFormSetValue<T>;
	watchedType: AttachmentType;
	disabled?: boolean;
};

export function AttachmentTypeSelector<T extends FieldValues>({
	control,
	nameType,
	nameRequire,
	setValue,
	watchedType,
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
							if (val === ATTACHMENT_TYPES.NONE) {
								setValue(nameRequire, false as PathValue<T, Path<T>>);
							}
						}}
						disabled={disabled}
					/>
				)}
			/>

			{watchedType !== ATTACHMENT_TYPES.NONE && (
				<Controller
					control={control}
					name={nameRequire}
					render={({ field: { onChange, value } }) => (
						<Pressable
							onPress={() => !disabled && onChange(!value)}
							disabled={disabled}
							className={cn(
								"flex-row items-center justify-between rounded-3xl border border-border bg-surface-fg p-5",
								disabled && "opacity-50",
							)}
						>
							<View className="gap-1 flex-1">
								<Text className="font-bold text-text-strong text-base">
									Require Attachment
								</Text>
								<Text className="text-text-light text-sm">
									Must provide proof to log this goal
								</Text>
							</View>
							<View
								className={cn(
									"h-8 w-14 rounded-full px-1 justify-center",
									value ? "bg-action-primary" : "bg-state-muted-bg",
								)}
							>
								<View
									className={cn(
										"h-6 w-6 rounded-full bg-white shadow-sm",
										value ? "self-end" : "self-start",
									)}
								/>
							</View>
						</Pressable>
					)}
				/>
			)}
		</View>
	);
}
