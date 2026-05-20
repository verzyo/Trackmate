import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import type { ScrollView } from "react-native";
import { GoalEditActions } from "@/components/goal/GoalEditActions";
import { GoalFormScreen } from "@/components/layout/GoalFormScreen";
import AppLoadingScreen from "@/components/layout/LoadingScreen";
import FilledButton from "@/components/ui/FilledButton";
import { useErrorHandler } from "@/hooks/common/useErrorHandler";
import { useGoalForm } from "@/hooks/goal/useGoalForm";
import {
	useCreateInvite,
	useDeleteGoal,
	useDeleteInvite,
	useKickParticipant,
	useLeaveGoal,
	useUpdateGoalMetadata,
	useUpdateParticipant,
} from "@/hooks/goal/useGoalMutations";
import { useGoal, useGoalPendingInvites } from "@/hooks/goal/useGoalQueries";
import { useInviteManagement } from "@/hooks/goal/useInviteManagement";
import { useProfilesByIds } from "@/hooks/profile/useProfileHooks";
import type { GoalForm, UpdateGoalMetadataParams } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";

export default function EditGoalScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { handleError } = useErrorHandler();
	const scrollViewRef = useRef<ScrollView>(null);
	const { user } = useAuthStore();
	const userId = user?.id;
	const { data: goal, isLoading: isGoalLoading } = useGoal(id as string);
	const { data: pendingInvites } = useGoalPendingInvites(id as string);
	const updateMetadataMutation = useUpdateGoalMetadata();
	const deleteGoalMutation = useDeleteGoal();
	const createInviteMutation = useCreateInvite();
	const deleteInviteMutation = useDeleteInvite();
	const kickParticipantMutation = useKickParticipant();
	const leaveGoalMutation = useLeaveGoal();
	const updateParticipantMutation = useUpdateParticipant();
	const isOwner = goal?.owner_id === userId;

	const participantIds =
		goal?.goal_participants
			.map((p) => p.user_id)
			.filter((pId) => pId !== goal.owner_id) || [];
	const { data: memberProfiles } = useProfilesByIds(participantIds);

	const { invitees, addInvite, removeInvite } = useInviteManagement(
		userId,
		goal?.goal_participants.map((p) => p.user_id),
	);

	const allInvites = [
		...(memberProfiles?.map((mp) => ({
			id: mp.id,
			username: mp.username,
			nickname: mp.nickname,
			avatar_url: mp.avatar_url,
			isMember: true,
		})) || []),
		...(pendingInvites?.map((pi: any) => ({
			id: pi.invitee_id,
			username: pi.invitee.username,
			nickname: pi.invitee.nickname,
			avatar_url: pi.invitee.avatar_url,
			isPending: true,
			inviteId: pi.id,
		})) || []),
		...invitees,
	];
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
		if (!goal) {
			return;
		}
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
		<GoalFormScreen
			title="Edit Goal"
			control={control}
			errors={errors}
			isOwner={isOwner}
			selectedIcon={selectedIcon}
			selectedColor={selectedColor}
			onIconChange={setSelectedIcon}
			onColorChange={setSelectedColor}
			invitees={allInvites}
			onAddInvite={addInvite}
			onRemoveInvite={removeInvite}
			onCancelInvite={(inviteId) =>
				deleteInviteMutation.mutate(
					{ inviteId, goalId: id as string },
					{
						onError: (error) => handleError(error, "Failed to cancel invite"),
					},
				)
			}
			onKickMember={(memberId) =>
				kickParticipantMutation.mutate(
					{ goalId: id as string, userId: memberId },
					{
						onError: (error) => handleError(error, "Failed to kick member"),
					},
				)
			}
			handleInviteInputFocus={handleInviteInputFocus}
			currentUserId={userId}
			existingParticipants={goal?.goal_participants.map((p) => p.user_id)}
			scrollViewRef={scrollViewRef}
			actions={
				<>
					<FilledButton
						onPress={handleSubmit(onSave)}
						disabled={isLoading}
						className="mt-4"
						label={isLoading ? "Saving..." : "Save Goal"}
					/>
					<GoalEditActions goalId={id as string} isOwner={isOwner} />
				</>
			}
		/>
	);
}
