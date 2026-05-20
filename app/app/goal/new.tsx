import { router } from "expo-router";
import { useRef, useState } from "react";
import type { ScrollView } from "react-native";

import { AttachmentTypeSelector } from "@/components/goal/fields/AttachmentTypeSelector";
import { GoalFieldsSection } from "@/components/goal/fields/GoalFieldsSection";
import { GoalFrequencyEditor } from "@/components/goal/fields/GoalFrequencyEditor";
import { StartDatePicker } from "@/components/goal/fields/StartDatePicker";
import { GoalFormScreen } from "@/components/layout/GoalFormScreen";
import FilledButton from "@/components/ui/FilledButton";
import { ATTACHMENT_TYPES } from "@/constants/attachmentTypes";
import { useErrorHandler } from "@/hooks/common/useErrorHandler";
import { useToday } from "@/hooks/common/useToday";
import { useGoalForm } from "@/hooks/goal/useGoalForm";
import { useCreateGoal, useCreateInvite } from "@/hooks/goal/useGoalMutations";
import { useInviteManagement } from "@/hooks/goal/useInviteManagement";
import type { GoalForm } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { formatToISODate } from "@/utils/date.utils";
import { transformGoalFormData } from "@/utils/goal.utils";

export default function NewGoalScreen() {
	const { user } = useAuthStore();
	const userId = user?.id;
	const { handleError } = useErrorHandler();
	const scrollViewRef = useRef<ScrollView>(null);

	const today = useToday();
	const [startDate, setStartDate] = useState(today);

	const { invitees, addInvite, removeInvite } = useInviteManagement(userId);

	const createGoalMutation = useCreateGoal();
	const createInviteMutation = useCreateInvite();

	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
		freqType,
		intervalInputValue,
		intervalValue,
		scheduledDays,
		selectedColor,
		selectedIcon,
		toggleDay,
		handleInviteInputFocus,
		onIntervalChange,
		onIntervalBlur,
		onIncrementInterval,
		onDecrementInterval,
	} = useGoalForm({ scrollViewRef });

	const onSubmit = async (data: GoalForm) => {
		if (!userId) return;

		const { frequencyValue, activeWeekly } = transformGoalFormData(data);

		router.back();

		try {
			const goalId = await createGoalMutation.mutateAsync({
				title: data.title,
				description: data.description,
				frequency_type: data.frequency_type,
				frequency_value: frequencyValue,
				weekly_days: activeWeekly,
				start_date: formatToISODate(startDate),
				attachment_type: data.attachment_type,
				require_attachment: data.attachment_type !== ATTACHMENT_TYPES.NONE,
				icon: data.icon,
				color: data.color,
				userId,
			});

			if (invitees.length > 0) {
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
		} catch (error) {
			handleError(error, "Failed to create goal");
		}
	};

	return (
		<GoalFormScreen
			title="Create Goal"
			control={control}
			errors={errors}
			isOwner={true}
			selectedIcon={selectedIcon}
			selectedColor={selectedColor}
			onIconChange={(icon) => setValue("icon", icon)}
			onColorChange={(color) => setValue("color", color)}
			invitees={invitees}
			onAddInvite={addInvite}
			onRemoveInvite={removeInvite}
			handleInviteInputFocus={handleInviteInputFocus}
			currentUserId={userId}
			scrollViewRef={scrollViewRef}
			actions={
				<FilledButton
					onPress={handleSubmit(onSubmit)}
					className="mt-4"
					label="Create Goal"
				/>
			}
		>
			<GoalFieldsSection title="Frequency*">
				<GoalFrequencyEditor
					frequencyType={freqType}
					onFrequencyTypeChange={(val) =>
						setValue("frequency_type", val, { shouldValidate: true })
					}
					intervalValue={intervalValue}
					intervalInputValue={intervalInputValue}
					onIntervalChange={onIntervalChange}
					onIntervalBlur={onIntervalBlur}
					onIncrementInterval={onIncrementInterval}
					onDecrementInterval={onDecrementInterval}
					scheduledDays={scheduledDays}
					onToggleDay={toggleDay}
					weeklyDaysError={errors.weekly_days?.message}
				/>
			</GoalFieldsSection>

			<GoalFieldsSection title="Start Date">
				<StartDatePicker value={startDate} onChange={setStartDate} />
			</GoalFieldsSection>

			<GoalFieldsSection title="Attachment">
				<AttachmentTypeSelector control={control} nameType="attachment_type" />
			</GoalFieldsSection>
		</GoalFormScreen>
	);
}
