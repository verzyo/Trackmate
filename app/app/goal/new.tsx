import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useRef, useState } from "react";
import type { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DatePicker } from "@/components/forms/DatePicker";
import { FormSection } from "@/components/forms/FormSection";
import { GoalBasicInfoFields } from "@/components/forms/GoalBasicInfoFields";
import { GoalFormShell } from "@/components/forms/GoalFormShell";
import { InviteManager } from "@/components/forms/InviteManager";
import { AttachmentTypeSelector } from "@/components/goal/AttachmentTypeSelector";
import { GoalAppearancePicker } from "@/components/goal/GoalAppearancePicker";
import { GoalFrequencyEditor } from "@/components/goal/GoalFrequencyEditor";
import FilledButton from "@/components/ui/FilledButton";
import { ATTACHMENT_TYPES } from "@/constants/attachmentTypes";
import { useErrorHandler } from "@/hooks/common/useErrorHandler";
import { useKeyboard } from "@/hooks/common/useKeyboard";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { useToday } from "@/hooks/common/useToday";
import { useGoalForm } from "@/hooks/goal/useGoalForm";
import {
    useCreateGoal,
    useCreateInvite
} from "@/hooks/goal/useGoalMutations";
import { useInviteManagement } from "@/hooks/goal/useInviteManagement";
import type { GoalForm } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { formatToISODate } from "@/utils/date.utils";

import { transformGoalFormData } from "@/utils/goal.utils";

export default function NewGoalScreen() {
	const { user } = useAuthStore();
	const userId = user?.id;
	const colors = useThemeColors();
	const { handleError } = useErrorHandler();
	const _insets = useSafeAreaInsets();
	const scrollViewRef = useRef<ScrollView>(null);
	const { keyboardHeight } = useKeyboard();

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

	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<GoalFormShell
			title="Create Goal"
			scrollViewRef={scrollViewRef}
			insetsBottom={_insets.bottom}
			keyboardHeight={keyboardHeight}
			isDark={isDark}
		>
			<FormSection title="Appearance" titleColor={colors.textStrong}>
				<GoalAppearancePicker
					selectedIcon={selectedIcon}
					selectedColor={selectedColor}
					onIconChange={(icon) => setValue("icon", icon)}
					onColorChange={(color) => setValue("color", color)}
				/>
			</FormSection>

			<FormSection title="Basic Info" titleColor={colors.textStrong}>
				<GoalBasicInfoFields
					control={control}
					titleError={errors.title?.message}
					descriptionError={errors.description?.message}
				/>
			</FormSection>

			<FormSection title="Frequency*" titleColor={colors.textStrong}>
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
			</FormSection>

			<FormSection title="Start Date" titleColor={colors.textStrong}>
				<DatePicker value={startDate} onChange={setStartDate} />
			</FormSection>

			<FormSection title="Attachment" titleColor={colors.textStrong}>
				<AttachmentTypeSelector control={control} nameType="attachment_type" />
			</FormSection>

			<FormSection title="Participants" titleColor={colors.textStrong}>
				<InviteManager
					invitees={invitees}
					onAdd={addInvite}
					onRemove={removeInvite}
					onInputFocus={handleInviteInputFocus}
					onInputPress={handleInviteInputFocus}
					userId={userId}
				/>
			</FormSection>

			<FilledButton
				onPress={handleSubmit(onSubmit)}
				className="mt-4"
				label="Create Goal"
			/>
		</GoalFormShell>
	);
}
