import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AttachmentBottomSheet, {
	type AttachmentBottomSheetRef,
} from "@/components/AttachmentBottomSheet";
import { GoalActionButtons } from "@/components/goal/GoalActionButtons";
import { GoalAttachmentAction } from "@/components/goal/GoalAttachmentAction";
import { GoalConsistencyHeatmap } from "@/components/goal/GoalConsistencyHeatmap";
import { GoalDetailHeader } from "@/components/goal/GoalDetailHeader";
import { GoalFrequencyCard } from "@/components/goal/GoalFrequencyCard";
import { GoalParticipantsList } from "@/components/goal/GoalParticipantsList";
import { Screen } from "@/components/layout/Screen";
import AppLoadingScreen from "@/components/ui/AppLoadingScreen";
import { useThemeColors } from "@/hooks/common/useThemeColors";
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
	useTodayCompletion,
	useTodaysCompletionsForGoals,
} from "@/hooks/goal/useGoalQueries";
import { useProfilesByIds } from "@/hooks/profile/useProfileHooks";
import type { AttachmentData } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage, showAlert } from "@/utils/error.utils";

export default function GoalDetailsModal() {
	const { id, inviteId } = useLocalSearchParams<{
		id: string;
		inviteId?: string;
	}>();
	const userId = useAuthStore((state) => state.user?.id);
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const { data: goal, isLoading, error } = useGoal(id as string);
	const {
		data: todayCompletion,
		refetch: refetchToday,
		isLoading: isTodayCompletionLoading,
	} = useTodayCompletion(id as string, userId);
	const { data: completions } = useGoalCompletions(id as string, userId);
	const { data: todaysCompletions } = useTodaysCompletionsForGoals(
		id ? [id as string] : [],
	);

	const attachmentSheetRef = useRef<AttachmentBottomSheetRef>(null);

	const acceptInviteMutation = useAcceptInvite();
	const declineInviteMutation = useDeclineInvite();
	const completeMutation = useCompleteGoal();
	const uncompleteMutation = useUncompleteGoal();
	const updateAttachmentMutation = useUpdateCompletion();

	const participantIds = useMemo(
		() =>
			goal?.goal_participants.map((participant) => participant.user_id) ?? [],
		[goal],
	);
	const { data: profiles } = useProfilesByIds(participantIds);

	const profileMap = useMemo(() => {
		const map = new Map<
			string,
			{ username: string; nickname?: string | null; avatar_url?: string | null }
		>();

		for (const profile of profiles ?? []) {
			map.set(profile.id, {
				username: profile.username,
				nickname: profile.nickname,
				avatar_url: profile.avatar_url,
			});
		}

		return map;
	}, [profiles]);

	if (isLoading || isTodayCompletionLoading) {
		return <AppLoadingScreen message="Loading details..." />;
	}

	if (error || !goal) {
		return (
			<Screen className="items-center justify-center px-6 py-4">
				<Text
					className="text-base text-state-danger"
					style={{ color: colors.danger }}
				>
					Failed to load goal details
				</Text>
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

	const participant = goal.goal_participants.find((p) => p.user_id === userId);
	const iconName = participant?.icon || "Target";
	const iconColor = participant?.color || colors.actionPrimary;
	const completedDateKeys = (completions ?? []).map((completion) =>
		String(completion.completed_date),
	);
	const completedParticipants = new Set(
		(todaysCompletions ?? []).map((completion) => completion.user_id),
	);
	const participantItems = goal.goal_participants.map((goalParticipant) => {
		const profile = profileMap.get(goalParticipant.user_id);
		return {
			id: goalParticipant.user_id,
			name:
				profile?.nickname ||
				profile?.username ||
				(goalParticipant.user_id === goal.owner_id ? "Owner" : "Participant"),
			username: profile?.username || "user",
			avatarUrl: profile?.avatar_url ?? undefined,
			completed: completedParticipants.has(goalParticipant.user_id),
			role: goalParticipant.user_id === goal.owner_id ? "owner" : "member",
		} as const;
	});
	const isInviteState = !!inviteId && !isParticipant;
	const showPrimaryAction = isParticipant || isInviteState;
	const primaryButtonLabel = isInviteState
		? acceptInviteMutation.isPending
			? "Accepting..."
			: "Accept Invite"
		: isCompletedToday
			? "Undo Completion"
			: "Complete Goal";
	const secondaryButtonLabel = declineInviteMutation.isPending
		? "Declining..."
		: "Decline Invite";

	return (
		<Screen className="bg-surface-bg">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerClassName="px-6 py-4"
				contentContainerStyle={{
					paddingBottom: showPrimaryAction
						? Math.max(insets.bottom + 120, 144)
						: Math.max(insets.bottom + 32, 40),
				}}
			>
				<View className="gap-6">
					<GoalDetailHeader
						goal={goal}
						goalId={id as string}
						isParticipant={isParticipant}
						iconName={iconName}
						iconColor={iconColor}
						textStrongColor={colors.textStrong}
						textDefaultColor={colors.textDefault}
					/>

					<GoalFrequencyCard
						frequencyType={goal.frequency_type}
						frequencyValue={goal.frequency_value}
						weeklyDays={goal.weekly_days}
					/>

					<GoalConsistencyHeatmap
						completedDates={completedDateKeys}
						frequencyType={goal.frequency_type}
						frequencyValue={goal.frequency_value}
						startDate={goal.start_date}
						weeklyDays={goal.weekly_days}
					/>

					<GoalParticipantsList participants={participantItems} />

					<GoalAttachmentAction
						goal={goal}
						isParticipant={isParticipant}
						isCompletedToday={isCompletedToday}
						hasAttachment={!!todayCompletion?.attachment_data}
						onPress={handleAddAttachment}
						actionPrimaryColor={colors.actionPrimary}
					/>
				</View>
			</ScrollView>

			<GoalActionButtons
				showPrimaryAction={showPrimaryAction}
				isInviteState={isInviteState}
				isCompletedToday={isCompletedToday}
				isPending={
					completeMutation.isPending ||
					uncompleteMutation.isPending ||
					acceptInviteMutation.isPending ||
					declineInviteMutation.isPending
				}
				insetsBottom={insets.bottom}
				primaryButtonLabel={primaryButtonLabel}
				secondaryButtonLabel={secondaryButtonLabel}
				onAcceptInvite={handleAcceptInvite}
				onCompleteGoal={() => handleComplete()}
				onUndoComplete={handleUncomplete}
				onDeclineInvite={handleDeclineInvite}
			/>

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
