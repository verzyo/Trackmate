import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import type { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FormSection } from "@/components/forms/FormSection";
import { GoalBasicInfoFields } from "@/components/forms/GoalBasicInfoFields";
import { GoalFormShell } from "@/components/forms/GoalFormShell";
import { InviteManager } from "@/components/forms/InviteManager";
import { GoalAppearancePicker } from "@/components/goal/GoalAppearancePicker";
import { GoalEditActions } from "@/components/goal/GoalEditActions";
import AppLoadingScreen from "@/components/ui/AppLoadingScreen";
import FilledButton from "@/components/ui/FilledButton";
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
import { useGoal } from "@/hooks/goal/useGoalQueries";
import { useInviteManagement } from "@/hooks/goal/useInviteManagement";
import type { GoalForm, UpdateGoalMetadataParams } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";

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
	const _today = useToday();
	const { invitees, addInvite, removeInvite } = useInviteManagement(
		userId,
		goal?.goal_participants.map((p) => p.user_id),
	);
	const [selectedIcon, setSelectedIcon] = useState("Flag");
	const [selectedColor, setSelectedColor] = useState("#3b82f6");
	const [initialIcon, setInitialIcon] = useState("Flag");
	const [initialColor, setInitialColor] = useState("#3b82f6");

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
		handleInviteInputFocus,
	} = useGoalForm({ scrollViewRef });

	useEffect(() => {
		if (goal) {
			const participant = goal.goal_participants.find(
				(p) => p.user_id === userId,
			);

			setSelectedIcon(participant?.icon || "Flag");
			setSelectedColor(participant?.color || "#3b82f6");
			setInitialIcon(participant?.icon || "Flag");
			setInitialColor(participant?.color || "#3b82f6");

			reset({
				title: goal.title,
				description: goal.description || "",
				icon: participant?.icon || "Flag",
				color: participant?.color || "#3b82f6",
				frequency_type: goal.frequency_type,
				interval_days: String(goal.frequency_value),
				weekly_days: (goal.weekly_days || []).map((day) =>
					day === 7 ? 0 : day,
				),
				attachment_type: goal.attachment_type,
				require_attachment: goal.require_attachment,
			});
		}
	}, [goal, reset, userId]);

	const onSave = async (data: GoalForm) => {
		console.log("onSave called with data:", data);
		console.log("goal:", goal, "isOwner:", isOwner, "userId:", userId);
		if (!goal) {
			console.log("No goal, returning");
			return;
		}
		try {
			const metadataParams: Record<string, unknown> = { goal_id: id as string };
			let hasMetadataChanges = false;

			if (isOwner) {
				console.log("Checking metadata changes...");
				console.log("data.title:", data.title, "goal.title:", goal.title);
				console.log(
					"data.description:",
					data.description,
					"goal.description:",
					goal.description,
				);
				if (data.title !== goal.title) {
					metadataParams.title = data.title;
					hasMetadataChanges = true;
					console.log("Title changed");
				}
				if (data.description !== (goal.description || "")) {
					metadataParams.description = data.description;
					hasMetadataChanges = true;
					console.log("Description changed");
				}
			}

			const invitePromises: Promise<unknown>[] = [];
			if (isOwner && invitees.length > 0 && userId) {
				console.log("Processing invites:", invitees);
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
			console.log(
				"participantChanges:",
				participantChanges,
				"selectedIcon:",
				selectedIcon,
				"initialIcon:",
				initialIcon,
				"selectedColor:",
				selectedColor,
				"initialColor:",
				initialColor,
			);

			if (
				!hasMetadataChanges &&
				invitePromises.length === 0 &&
				!participantChanges
			) {
				console.log("No changes detected, going back");
				router.back();
				return;
			}

			const promises = [...invitePromises];

			if (participantChanges && userId) {
				console.log("Adding participant update");
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
				console.log("Adding metadata update:", metadataParams);
				promises.push(
					updateMetadataMutation.mutateAsync(
						metadataParams as UpdateGoalMetadataParams,
					),
				);
			}

			console.log("Executing promises:", promises.length);
			await Promise.all(promises);
			console.log("Save successful");
			router.back();
		} catch (error) {
			console.error("Save error:", error);
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
			<FormSection title="Appearance" titleColor={colors.textStrong}>
				<GoalAppearancePicker
					selectedIcon={selectedIcon}
					selectedColor={selectedColor}
					onIconChange={setSelectedIcon}
					onColorChange={setSelectedColor}
					stackColorsUnderIcon={!isOwner}
				/>
			</FormSection>

			{isOwner && (
				<FormSection title="Basic Info" titleColor={colors.textStrong}>
					<GoalBasicInfoFields
						control={control}
						titleError={errors.title?.message}
						descriptionError={errors.description?.message}
						editable={isOwner}
					/>
				</FormSection>
			)}

			{isOwner && (
				<FormSection title="Participants" titleColor={colors.textStrong}>
					<InviteManager
						invitees={invitees}
						onAdd={addInvite}
						onRemove={removeInvite}
						onInputFocus={handleInviteInputFocus}
						onInputPress={handleInviteInputFocus}
						userId={userId}
						existingParticipants={goal?.goal_participants.map((p) => p.user_id)}
					/>
				</FormSection>
			)}

			<FilledButton
				onPress={() => {
					console.log("Save button pressed, calling handleSubmit");
					console.log("Form errors:", errors);
					handleSubmit(onSave)();
				}}
				disabled={isLoading}
				className="mt-4"
				label={isLoading ? "Saving..." : "Save Goal"}
			/>

			<GoalEditActions goalId={id as string} isOwner={isOwner} />
		</GoalFormShell>
	);
}
