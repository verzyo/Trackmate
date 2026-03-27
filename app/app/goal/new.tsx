import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, ScrollView, Text, View } from "react-native";
import { ZodError } from "zod";
import { AttachmentTypeSelector } from "@/components/forms/AttachmentTypeSelector";
import { DatePicker } from "@/components/forms/DatePicker";
import { FormField } from "@/components/forms/FormField";
import { FrequencyTypeSelector } from "@/components/forms/FrequencyTypeSelector";
import { InviteManager } from "@/components/forms/InviteManager";
import { Screen } from "@/components/layout/Screen";
import {
	ATTACHMENT_TYPES,
	type AttachmentType,
} from "@/constants/attachmentTypes";
import {
	FREQUENCY_TYPES,
	type FrequencyType,
} from "@/constants/frequencyTypes";
import { useToday } from "@/hooks/common/useToday";
import { useCreateGoal, useCreateInvite } from "@/hooks/goal/useGoalMutations";
import { useInviteManagement } from "@/hooks/goal/useInviteManagement";
import type { CreateGoalParams } from "@/schemas/goal.schema";
import {
	createWeeklyDaysSchema,
	type GoalForm,
	GoalFormSchema,
} from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { formatToISODate } from "@/utils/date.utils";
import { showAlert } from "@/utils/error.utils";

export default function NewGoalModal() {
	const { user } = useAuthStore();
	const userId = user?.id;

	const today = useToday();

	const [frequencyType, setFrequencyType] = useState<FrequencyType>(
		FREQUENCY_TYPES.INTERVAL,
	);
	const [startDate, setStartDate] = useState(today);

	const { invitees, addInvite, removeInvite } = useInviteManagement(userId);

	const createGoalMutation = useCreateGoal();
	const createInviteMutation = useCreateInvite();

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<GoalForm>({
		resolver: zodResolver(GoalFormSchema),
		defaultValues: {
			title: "",
			description: "",
			interval_days: "1",
			weekly_days: "1",
			attachment_type: ATTACHMENT_TYPES.NONE,
			require_attachment: false,
		},
	});

	const watchedAttachmentType = watch("attachment_type") as AttachmentType;

	const onSubmit = async (data: GoalForm) => {
		try {
			let activeWeekly: number[] | null = null;
			if (frequencyType === FREQUENCY_TYPES.WEEKLY) {
				activeWeekly = createWeeklyDaysSchema().parse(data.weekly_days);
			}

			let frequencyValue = 1;
			if (frequencyType === FREQUENCY_TYPES.INTERVAL) {
				frequencyValue = parseInt(data.interval_days, 10);
			} else if (frequencyType === FREQUENCY_TYPES.WEEKLY && activeWeekly) {
				frequencyValue = activeWeekly.length;
			}

			const params: CreateGoalParams = {
				title: data.title,
				description: data.description,
				frequency_type: frequencyType,
				frequency_value: frequencyValue,
				weekly_days:
					frequencyType === FREQUENCY_TYPES.WEEKLY ? activeWeekly : null,
				start_date: formatToISODate(startDate),
				attachment_type: data.attachment_type,
				require_attachment: data.require_attachment,
			};

			const goalId = await createGoalMutation.mutateAsync(params);

			if (invitees.length > 0 && userId) {
				await Promise.all(
					invitees.map((invitee) =>
						createInviteMutation.mutateAsync({
							goalId: goalId as string,
							inviterId: userId,
							inviteeId: invitee.id,
						}),
					),
				);
			}

			router.back();
		} catch (error) {
			let errorMessage =
				error instanceof Error ? error.message : "Failed to create goal";

			if (error instanceof ZodError) {
				errorMessage = error.issues[0].message;
			}

			if (errorMessage.includes("title_not_empty")) {
				errorMessage = "Goal title cannot be empty.";
			}

			showAlert(errorMessage);
		}
	};

	const isLoading =
		isSubmitting ||
		createGoalMutation.isPending ||
		createInviteMutation.isPending;

	return (
		<Screen className="px-6 py-4">
			<ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4">
				<FormField
					control={control}
					name="title"
					label="Title*"
					placeholder="e.g. Morning Run"
					error={errors.title?.message}
					className="text-center border-b border-gray-300 pb-2"
				/>

				<FormField
					control={control}
					name="description"
					label="Description"
					placeholder="Optional details"
					error={errors.description?.message}
					className="text-center border-b border-gray-300 pb-2"
				/>

				<Text className="mt-4 font-bold">Frequency Type*</Text>
				<FrequencyTypeSelector
					value={frequencyType}
					onChange={setFrequencyType}
				/>

				{frequencyType === FREQUENCY_TYPES.INTERVAL && (
					<FormField
						control={control}
						name="interval_days"
						label="Every X Days*"
						placeholder="e.g. 1 for everyday"
						keyboardType="number-pad"
						error={errors.interval_days?.message}
						className="text-center border-b border-gray-300 pb-2"
					/>
				)}

				{frequencyType === FREQUENCY_TYPES.WEEKLY && (
					<FormField
						control={control}
						name="weekly_days"
						label="Days of the Week (1=Mon, 7=Sun)*"
						placeholder="e.g. 1, 3, 5"
						error={errors.weekly_days?.message}
						className="text-center border-b border-gray-300 pb-2"
					/>
				)}

				<DatePicker
					label="Start Date*"
					value={startDate}
					onChange={setStartDate}
				/>

				<Text className="mt-4 font-bold">Attachment Type</Text>
				<AttachmentTypeSelector
					control={control}
					nameType="attachment_type"
					nameRequire="require_attachment"
					setValue={setValue}
					watchedType={watchedAttachmentType}
				/>

				<View className="h-[1px] bg-gray-300 w-full my-4" />

				<InviteManager
					invitees={invitees}
					onAdd={addInvite}
					onRemove={removeInvite}
				/>

				<View className="mt-8 mb-6">
					<Button
						title={isLoading ? "Creating..." : "Create Goal"}
						onPress={handleSubmit(onSubmit)}
						disabled={isLoading}
					/>
				</View>
			</ScrollView>
		</Screen>
	);
}
