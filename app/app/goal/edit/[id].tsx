import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import type { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DatePicker } from "@/components/forms/DatePicker";
import { FormSection } from "@/components/forms/FormSection";
import { GoalBasicInfoFields } from "@/components/forms/GoalBasicInfoFields";
import { GoalFormShell } from "@/components/forms/GoalFormShell";
import { InviteManager } from "@/components/forms/InviteManager";
import { AttachmentTypeSelector } from "@/components/goal/AttachmentTypeSelector";
import { GoalAppearancePicker } from "@/components/goal/GoalAppearancePicker";
import { GoalEditActions } from "@/components/goal/GoalEditActions";
import { GoalFrequencyEditor } from "@/components/goal/GoalFrequencyEditor";
import AppLoadingScreen from "@/components/ui/AppLoadingScreen";
import FilledButton from "@/components/ui/FilledButton";
import { FREQUENCY_TYPES } from "@/constants/frequencyTypes";
import { useErrorHandler } from "@/hooks/common/useErrorHandler";
import { useKeyboard } from "@/hooks/common/useKeyboard";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { useToday } from "@/hooks/common/useToday";
import { useGoalForm } from "@/hooks/goal/useGoalForm";
import {
	useCreateInvite,
	useDeleteGoal,
	useLeaveGoal,
	useUpdateGoalMetadata,
	useUpdateParticipant,
} from "@/hooks/goal/useGoalMutations";
import { useGoal, useGoalCompletions } from "@/hooks/goal/useGoalQueries";
import { useInviteManagement } from "@/hooks/goal/useInviteManagement";
import type { GoalForm, UpdateGoalMetadataParams } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { formatToISODate } from "@/utils/date.utils";

export default function EditGoalScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const colors = useThemeColors();
	const { handleError } = useErrorHandler();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";
	const insets = useSafeAreaInsets();
	const scrollViewRef = useRef<ScrollView>(null);
	const { keyboardHeight } = useKeyboard();
	const { data: goal, isLoading: isGoalLoading } = useGoal(id as string);
	const updateMetadataMutation = useUpdateGoalMetadata();
	const deleteGoalMutation = useDeleteGoal();
	const createInviteMutation = useCreateInvite();
	const leaveGoalMutation = useLeaveGoal();
	const updateParticipantMutation = useUpdateParticipant();

	const { user } = useAuthStore();
	const userId = user?.id;
	const isOwner = goal?.owner_id === userId;
	const { data: completions } = useGoalCompletions(id as string, userId);
	const hasCompletions = (completions?.length ?? 0) > 0;
	const today = useToday();
	const { invitees, addInvite, removeInvite } = useInviteManagement(
		userId,
		goal?.goal_participants.map((p) => p.user_id),
	);
	const [startDate, setStartDate] = useState(today);
	const [selectedIcon, setSelectedIcon] = useState("Flag");
	const [selectedColor, setSelectedColor] = useState("#3b82f6");
	const [initialIcon, setInitialIcon] = useState("Flag");
	const [initialColor, setInitialColor] = useState("#3b82f6");

	const {
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
		freqType,
		intervalInputValue,
		intervalValue,
		scheduledDays,
		watchedAttachmentType,
		toggleDay,
		handleInviteInputFocus,
		onIntervalBlur,
		onIncrementInterval,
		onDecrementInterval,
	} = useGoalForm({ scrollViewRef });

	const frequencyEditDisabled = !isOwner || hasCompletions;

	const handleIntervalChange = (text: string) => {
		if (frequencyEditDisabled) return;
		const sanitized = text.replace(/\D/g, "");
		setValue(
			"interval_days",
			sanitized === "" ? "" : String(Math.max(1, Number(sanitized))),
		);
	};

	const handleToggleDay = (val: number) => {
		if (frequencyEditDisabled) return;
		toggleDay(val);
	};

	useEffect(() => {
		if (goal) {
			const participant = goal.goal_participants.find(
				(p) => p.user_id === userId,
			);
			const start = goal.start_date ? new Date(goal.start_date) : today;
			const normalizedStartDate = new Date(
				Date.UTC(
					start.getUTCFullYear(),
					start.getUTCMonth(),
					start.getUTCDate(),
				),
			);

			setStartDate(normalizedStartDate);
			setSelectedIcon(participant?.icon || "Flag");
			setSelectedColor(participant?.color || "#3b82f6");
			setInitialIcon(participant?.icon || "Flag");
			setInitialColor(participant?.color || "#3b82f6");

			reset({
				title: goal.title,
				description: goal.description || "",
				frequency_type: goal.frequency_type,
				interval_days: String(goal.frequency_value),
				weekly_days: goal.weekly_days ?? [1],
				attachment_type: goal.attachment_type,
				require_attachment: goal.require_attachment,
				color: participant?.color || "#3b82f6",
				icon: participant?.icon || "Flag",
			});
		}
	}, [goal, reset, today, userId]);

	const onSave = async (data: GoalForm) => {
		if (!goal) return;
		try {
			const metadataParams: Record<string, unknown> = { goal_id: id as string };
			let hasMetadataChanges = false;

			if (isOwner) {
				if (data.title !== goal.title) {
					metadataParams.title = data.title;
					hasMetadataChanges = true;
				}
				if (data.description !== (goal.description || "")) {
					metadataParams.description = data.description;
					hasMetadataChanges = true;
				}

				if (!hasCompletions) {
					let frequencyValue = 1;
					let weeklyDays: number[] | null = null;

					if (data.frequency_type === FREQUENCY_TYPES.INTERVAL) {
						frequencyValue = parseInt(data.interval_days, 10);
					} else {
						weeklyDays = data.weekly_days.length > 0 ? data.weekly_days : [];
						frequencyValue = weeklyDays.length > 0 ? weeklyDays.length : 1;
					}

					const originalWeekly = goal.weekly_days ?? [];
					const nextWeekly = weeklyDays ?? [];
					const weeklyChanged =
						originalWeekly.length !== nextWeekly.length ||
						[...originalWeekly]
							.sort()
							.some((day, index) => day !== [...nextWeekly].sort()[index]);

					if (
						data.frequency_type !== goal.frequency_type ||
						frequencyValue !== goal.frequency_value
					) {
						metadataParams.frequency_type = data.frequency_type;
						metadataParams.frequency_value = frequencyValue;
						hasMetadataChanges = true;
					}

					if (weeklyChanged) {
						metadataParams.weekly_days = weeklyDays;
						hasMetadataChanges = true;
					}

					const nextStartDate = formatToISODate(startDate);
					const currentStartDate = goal.start_date
						? formatToISODate(new Date(goal.start_date))
						: null;
					if (nextStartDate !== currentStartDate) {
						metadataParams.start_date = nextStartDate;
						hasMetadataChanges = true;
					}
				}

				if (data.attachment_type !== goal.attachment_type) {
					metadataParams.attachment_type = data.attachment_type;
					hasMetadataChanges = true;
				}
				if (data.require_attachment !== goal.require_attachment) {
					metadataParams.require_attachment = data.require_attachment;
					hasMetadataChanges = true;
				}
			}

			const invitePromises: Promise<unknown>[] = [];
			if (isOwner && invitees.length > 0 && userId) {
				invitePromises.push(
					...invitees.map((invitee) =>
						createInviteMutation.mutateAsync({
							goalId: id as string,
							inviterId: userId,
							inviteeId: invitee.id,
						}),
					),
				);
			}

			const participantChanges =
				selectedIcon !== initialIcon || selectedColor !== initialColor;

			if (
				!hasMetadataChanges &&
				invitePromises.length === 0 &&
				!participantChanges
			) {
				router.back();
				return;
			}

			const promises = [...invitePromises];

			if (participantChanges && userId) {
				promises.push(
					updateParticipantMutation.mutateAsync({
						goalId: id as string,
						userId,
						icon: selectedIcon,
						color: selectedColor,
					}),
				);
			}

			if (hasMetadataChanges) {
				promises.push(
					updateMetadataMutation.mutateAsync(
						metadataParams as UpdateGoalMetadataParams,
					),
				);
			}

			await Promise.all(promises);
			router.back();
		} catch (error) {
			handleError(error, "Failed to update goal");
		}
	};

	if (isGoalLoading) {
		return <AppLoadingScreen />;
	}

	const isLoading =
		updateMetadataMutation.isPending ||
		deleteGoalMutation.isPending ||
		createInviteMutation.isPending ||
		leaveGoalMutation.isPending ||
		updateParticipantMutation.isPending;

	return (
		<GoalFormShell
			title="Edit Goal"
			scrollViewRef={scrollViewRef}
			insetsBottom={insets.bottom}
			keyboardHeight={keyboardHeight}
			isDark={isDark}
		>
			<GoalAppearancePicker
				selectedIcon={selectedIcon}
				selectedColor={selectedColor}
				onIconChange={setSelectedIcon}
				onColorChange={setSelectedColor}
			/>

			<GoalBasicInfoFields
				control={control}
				titleError={errors.title?.message}
				descriptionError={errors.description?.message}
				editable={isOwner}
			/>

			<FormSection title="Frequency*" titleColor={colors.textStrong}>
				<GoalFrequencyEditor
					frequencyType={freqType}
					onFrequencyTypeChange={(val) =>
						setValue("frequency_type", val, { shouldValidate: true })
					}
					intervalValue={intervalValue}
					intervalInputValue={intervalInputValue}
					onIntervalChange={handleIntervalChange}
					onIntervalBlur={onIntervalBlur}
					onIncrementInterval={onIncrementInterval}
					onDecrementInterval={onDecrementInterval}
					scheduledDays={scheduledDays}
					onToggleDay={handleToggleDay}
					weeklyDaysError={errors.weekly_days?.message}
					disabled={frequencyEditDisabled}
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
				disabled={frequencyEditDisabled}
			/>

			<FormSection title="Attachment" titleColor={colors.textStrong}>
				<AttachmentTypeSelector
					control={control}
					nameType="attachment_type"
					nameRequire="require_attachment"
					setValue={setValue}
					watchedType={watchedAttachmentType}
					disabled={!isOwner}
				/>
			</FormSection>

			{isOwner && (
				<FormSection title="Participants" titleColor={colors.textStrong}>
					<InviteManager
						invitees={invitees}
						onAdd={addInvite}
						onRemove={removeInvite}
						onInputFocus={handleInviteInputFocus}
						onInputPress={handleInviteInputFocus}
					/>
				</FormSection>
			)}

			<FilledButton
				onPress={handleSubmit(onSave)}
				disabled={isLoading}
				className="mt-auto"
				label={isLoading ? "Saving..." : "Save Goal"}
			/>

			<GoalEditActions goalId={id as string} isOwner={isOwner} />
		</GoalFormShell>
	);
}
