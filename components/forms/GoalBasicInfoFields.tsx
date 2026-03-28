import type { Control } from "react-hook-form";
import { View } from "react-native";
import type { GoalForm } from "@/schemas/goal.schema";
import { FormField } from "./FormField";

type GoalBasicInfoFieldsProps = {
	control: Control<GoalForm>;
	titleError?: string;
	descriptionError?: string;
	editable?: boolean;
};

export function GoalBasicInfoFields({
	control,
	titleError,
	descriptionError,
	editable = true,
}: GoalBasicInfoFieldsProps) {
	return (
		<View className="gap-2">
			<FormField
				control={control}
				name="title"
				label="Title*"
				placeholder="e.g. Run 10 km"
				error={titleError}
				editable={editable}
			/>

			<FormField
				control={control}
				name="description"
				label="Description"
				placeholder="Describe your goal's objective..."
				error={descriptionError}
				multiline
				editable={editable}
				style={{
					height: 100,
					textAlignVertical: "top",
					paddingTop: 16,
				}}
			/>
		</View>
	);
}
