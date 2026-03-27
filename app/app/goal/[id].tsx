import { type Href, router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import {
	ActivityIndicator,
	Button,
	ScrollView,
	Text,
	View,
} from "react-native";
import AttachmentBottomSheet, {
	type AttachmentBottomSheetRef,
} from "@/components/AttachmentBottomSheet";
import { GoalCompletionsList } from "@/components/goal/GoalCompletionsList";
import { GoalDetails } from "@/components/goal/GoalDetails";
import { Screen } from "@/components/layout/Screen";
import { ATTACHMENT_TYPES } from "@/constants/attachmentTypes";
import {
	useAcceptInvite,
	useCompleteGoal,
	useDeclineInvite,
	useUncompleteGoal,
	useUpdateCompletion,
} from "@/hooks/goal/useGoalMutations";
import {
	useGoal,
	useGoalCompletions,
	useGoalMonthlyPoints,
	useGoalStreak,
	useTodayCompletion,
} from "@/hooks/goal/useGoalQueries";
import type { AttachmentData } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage, showAlert } from "@/utils/error.utils";

export default function GoalDetailsModal() {
	const { id, inviteId } = useLocalSearchParams<{
		id: string;
		inviteId?: string;
	}>();
	const userId = useAuthStore((state) => state.user?.id);
	const { data: goal, isLoading, error } = useGoal(id as string);
	const { data: streak, isLoading: streakLoading } = useGoalStreak(
		id as string,
		userId,
	);
	const { data: monthlyPoints, isLoading: pointsLoading } =
		useGoalMonthlyPoints(id as string, userId);
	const {
		data: todayCompletion,
		refetch: refetchToday,
		isLoading: isTodayCompletionLoading,
	} = useTodayCompletion(id as string, userId);
	const { data: completions } = useGoalCompletions(id as string, userId);

	const attachmentSheetRef = useRef<AttachmentBottomSheetRef>(null);

	const acceptInviteMutation = useAcceptInvite();
	const declineInviteMutation = useDeclineInvite();
	const completeMutation = useCompleteGoal();
	const uncompleteMutation = useUncompleteGoal();
	const updateAttachmentMutation = useUpdateCompletion();

	if (isLoading || isTodayCompletionLoading) {
		return (
			<Screen className="px-6 py-4 justify-center items-center">
				<ActivityIndicator size="large" />
				<Text className="mt-4">Loading details...</Text>
			</Screen>
		);
	}

	if (error || !goal) {
		return (
			<Screen className="px-6 py-4 justify-center items-center">
				<Text className="text-red-500">Failed to load goal details</Text>
			</Screen>
		);
	}

	const isCompletedToday = !!todayCompletion?.id;
	const isParticipant = goal.goal_participants.some(
		(p) => p.user_id === userId,
	);

	const handleAcceptInvite = async () => {
		if (!inviteId) return;
		try {
			await acceptInviteMutation.mutateAsync({
				inviteId,
				userId: userId as string,
			});
			router.setParams({ inviteId: undefined });
		} catch (e) {
			showAlert(getErrorMessage(e, "Failed to accept invite"));
		}
	};

	const handleDeclineInvite = async () => {
		if (!inviteId) return;
		try {
			await declineInviteMutation.mutateAsync({
				inviteId,
				userId: userId as string,
			});
			router.back();
		} catch (e) {
			showAlert(getErrorMessage(e, "Failed to decline invite"));
		}
	};

	const handleComplete = async (attachmentData?: AttachmentData) => {
		if (goal.require_attachment && !attachmentData) {
			attachmentSheetRef.current?.present();
			return;
		}

		if (!userId) return;
		try {
			await completeMutation.mutateAsync({
				goalId: goal.id,
				userId,
				attachmentData,
			});
			refetchToday();
		} catch (e) {
			showAlert(getErrorMessage(e, "Failed to complete goal"));
		}
	};

	const handleUncomplete = async () => {
		if (!userId) return;
		try {
			await uncompleteMutation.mutateAsync({ goalId: goal.id, userId });
			refetchToday();
		} catch (e) {
			showAlert(getErrorMessage(e, "Failed to uncomplete goal"));
		}
	};

	const handleAddAttachment = () => {
		attachmentSheetRef.current?.present();
	};

	return (
		<Screen className="px-6 py-4">
			<ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4 pb-10">
				<GoalDetails
					goal={goal}
					isParticipant={isParticipant}
					streak={streak}
					streakLoading={streakLoading}
					monthlyPoints={monthlyPoints}
					pointsLoading={pointsLoading}
				/>

				<View className="mt-4 w-full max-w-xs gap-4">
					{isParticipant && (
						<>
							{goal.attachment_type === ATTACHMENT_TYPES.NONE && (
								<Button
									title={isCompletedToday ? "Undo" : "Complete"}
									onPress={
										isCompletedToday ? handleUncomplete : () => handleComplete()
									}
									disabled={
										completeMutation.isPending || uncompleteMutation.isPending
									}
								/>
							)}

							{goal.attachment_type !== ATTACHMENT_TYPES.NONE &&
								(goal.require_attachment ? (
									<Button
										title={isCompletedToday ? "Completed \u2713" : "Complete"}
										onPress={() => handleComplete()}
										disabled={isCompletedToday || completeMutation.isPending}
									/>
								) : !isCompletedToday ? (
									<Button
										title={
											completeMutation.isPending ? "Completing..." : "Complete"
										}
										onPress={() => handleComplete()}
										disabled={completeMutation.isPending}
									/>
								) : (
									<View className="gap-2">
										<Button
											title="Add Attachment"
											onPress={handleAddAttachment}
										/>
										{todayCompletion?.attachment_data && (
											<Text className="text-center text-green-600 text-xs">
												Attachment present
											</Text>
										)}
										<Button
											title="Undo"
											color="red"
											onPress={handleUncomplete}
											disabled={uncompleteMutation.isPending}
										/>
									</View>
								))}
						</>
					)}

					{inviteId && !isParticipant ? (
						<View className="gap-4">
							<Button
								title={
									acceptInviteMutation.isPending
										? "Accepting..."
										: "Accept Invite"
								}
								onPress={handleAcceptInvite}
								disabled={
									acceptInviteMutation.isPending ||
									declineInviteMutation.isPending
								}
							/>
							<Button
								title={
									declineInviteMutation.isPending
										? "Declining..."
										: "Decline Invite"
								}
								color="red"
								onPress={handleDeclineInvite}
								disabled={
									acceptInviteMutation.isPending ||
									declineInviteMutation.isPending
								}
							/>
						</View>
					) : isParticipant ? (
						<Button
							title="EDIT GOAL"
							onPress={() => router.push(`/app/goal/edit/${id}` as Href)}
						/>
					) : null}
				</View>

				{isParticipant && completions && (
					<GoalCompletionsList completions={completions} />
				)}
			</ScrollView>

			{goal && (
				<AttachmentBottomSheet
					ref={attachmentSheetRef}
					goal={goal}
					onComplete={async (attachmentData) => {
						if (!userId) return;
						if (goal.require_attachment) {
							await completeMutation.mutateAsync({
								goalId: goal.id,
								userId,
								attachmentData,
							});
						} else if (attachmentData) {
							await updateAttachmentMutation.mutateAsync({
								goalId: goal.id,
								userId,
								attachmentData,
							});
						}
						refetchToday();
					}}
				/>
			)}
		</Screen>
	);
}
