import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { ScrollView, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AttachmentTypeSelector } from "@/components/forms/AttachmentTypeSelector";
import { DatePicker } from "@/components/forms/DatePicker";
import { FormSection } from "@/components/forms/FormSection";
import { GoalBasicInfoFields } from "@/components/forms/GoalBasicInfoFields";
import { GoalFormShell } from "@/components/forms/GoalFormShell";
import { GoalFrequencyEditor } from "@/components/forms/GoalFrequencyEditor";
import { InviteManager } from "@/components/forms/InviteManager";
import {
	GOAL_APPEARANCE_COLORS,
	GoalAppearancePicker,
} from "@/components/goal/GoalAppearancePicker";
import FilledButton from "@/components/ui/FilledButton";
import {
	ATTACHMENT_TYPES,
	type AttachmentType,
} from "@/constants/attachmentTypes";
import { FREQUENCY_TYPES } from "@/constants/frequencyTypes";
import { useKeyboard } from "@/hooks/common/useKeyboard";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { useToday } from "@/hooks/common/useToday";
import {
	useCreateGoal,
	useCreateInvite,
	useUpdateParticipant,
} from "@/hooks/goal/useGoalMutations";
import { useInviteManagement } from "@/hooks/goal/useInviteManagement";
import { type GoalForm, GoalFormSchema } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { formatToISODate } from "@/utils/date.utils";
import { showAlert } from "@/utils/error.utils";

export default function NewGoalScreen() {
	const { user } = useAuthStore();
	const userId = user?.id;
	const colors = useThemeColors();
	const _insets = useSafeAreaInsets();
	const scrollViewRef = useRef<ScrollView>(null);
	const { keyboardHeight } = useKeyboard();

	const today = useToday();
	const [startDate, setStartDate] = useState(today);

	const { invitees, addInvite, removeInvite } = useInviteManagement(userId);

	const createGoalMutation = useCreateGoal();
	const createInviteMutation = useCreateInvite();
	const updateParticipantMutation = useUpdateParticipant();

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<GoalForm>({
		resolver: zodResolver(GoalFormSchema),
		defaultValues: {
			title: "",
			description: "",
			frequency_type: FREQUENCY_TYPES.INTERVAL,
			interval_days: "1",
			weekly_days: [1],
			attachment_type: ATTACHMENT_TYPES.NONE,
			require_attachment: false,
			color:
				GOAL_APPEARANCE_COLORS[
					Math.floor(Math.random() * GOAL_APPEARANCE_COLORS.length)
				],
			icon: "Target",
		},
	});

	const freqType = watch("frequency_type");

	const selectedColor = watch("color") || GOAL_APPEARANCE_COLORS[0];
	const selectedIcon = watch("icon") || "Target";
	const watchedAttachmentType = watch("attachment_type") as AttachmentType;
	const intervalInputValue = watch("interval_days") ?? "1";

	const intervalValue = parseInt(intervalInputValue || "1", 10);
	const scheduledDays = watch("weekly_days") || [];

	const toggleDay = (val: number) => {
		const current = watch("weekly_days") || [];
		const next = current.includes(val)
			? current.filter((d) => d !== val)
			: [...current, val];
		setValue("weekly_days", next, { shouldValidate: true });
	};

	const handleInviteInputFocus = (_input: TextInput | null) => {
		requestAnimationFrame(() => {
			scrollViewRef.current?.scrollToEnd({ animated: true });
		});
	};

	const onSubmit = async (data: GoalForm) => {
		if (!userId) return;

		let activeWeekly: number[] | null = null;
		if (data.frequency_type === FREQUENCY_TYPES.WEEKLY) {
			if (data.weekly_days.length > 0) {
				activeWeekly = data.weekly_days;
			}
		}

		let frequencyValue = 1;
		if (data.frequency_type === FREQUENCY_TYPES.INTERVAL) {
			frequencyValue = parseInt(data.interval_days, 10);
		} else if (data.frequency_type === FREQUENCY_TYPES.WEEKLY) {
			frequencyValue = activeWeekly ? activeWeekly.length : 1;
		}

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
				require_attachment: data.require_attachment,
				icon: data.icon,
				color: data.color,
				userId,
			});

			await updateParticipantMutation.mutateAsync({
				goalId: goalId as string,
				userId,
				icon: data.icon,
				color: data.color,
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
			showAlert(
				error instanceof Error ? error.message : "Failed to create goal",
			);
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
			<GoalAppearancePicker
				selectedIcon={selectedIcon}
				selectedColor={selectedColor}
				onIconChange={(icon) => setValue("icon", icon)}
				onColorChange={(color) => setValue("color", color)}
			/>

			<GoalBasicInfoFields
				control={control}
				titleError={errors.title?.message}
				descriptionError={errors.description?.message}
			/>

			<FormSection title="Frequency*" titleColor={colors.textStrong}>
				<GoalFrequencyEditor
					frequencyType={freqType}
					onFrequencyTypeChange={(val) =>
						setValue("frequency_type", val, { shouldValidate: true })
					}
					intervalValue={intervalValue}
					intervalInputValue={intervalInputValue}
					onIntervalChange={(text) => {
						const sanitized = text.replace(/\D/g, "");
						setValue(
							"interval_days",
							sanitized === "" ? "" : String(Math.max(1, Number(sanitized))),
						);
					}}
					onIntervalBlur={() => {
						if (!intervalInputValue || intervalValue < 1) {
							setValue("interval_days", "1");
						}
					}}
					onIncrementInterval={() =>
						setValue("interval_days", (intervalValue + 1).toString())
					}
					onDecrementInterval={() =>
						setValue("interval_days", Math.max(1, intervalValue - 1).toString())
					}
					scheduledDays={scheduledDays}
					onToggleDay={toggleDay}
					weeklyDaysError={errors.weekly_days?.message}
					textStrongColor={colors.textStrong}
					textLightColor={colors.textLight}
					textDefaultColor={colors.textDefault}
					actionPrimaryColor={colors.actionPrimary}
				/>
			</FormSection>

			<DatePicker
				label="Start Date*"
				value={startDate}
				onChange={setStartDate}
			/>

			<FormSection title="Attachment" titleColor={colors.textStrong}>
				<AttachmentTypeSelector
					control={control}
					nameType="attachment_type"
					nameRequire="require_attachment"
					setValue={setValue}
					watchedType={watchedAttachmentType}
				/>
			</FormSection>

			<FormSection title="Participants" titleColor={colors.textStrong}>
				<InviteManager
					invitees={invitees}
					onAdd={addInvite}
					onRemove={removeInvite}
					onInputFocus={handleInviteInputFocus}
					onInputPress={handleInviteInputFocus}
				/>
			</FormSection>

			<FilledButton
				onPress={handleSubmit(onSubmit)}
				className="mt-auto"
				label="Create Goal"
			/>
		</GoalFormShell>
	);
}
