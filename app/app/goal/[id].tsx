import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AttachmentBottomSheet, {
	type AttachmentBottomSheetRef,
} from "@/components/AttachmentBottomSheet";
import { GoalActionButtons } from "@/components/goal/GoalActionButtons";
import { GoalAttachmentsList } from "@/components/goal/GoalAttachmentsList";
import { GoalConsistencyHeatmap } from "@/components/goal/GoalConsistencyHeatmap";
import { GoalDetailHeader } from "@/components/goal/GoalDetailHeader";
import { GoalFrequencyCard } from "@/components/goal/GoalFrequencyCard";
import { GoalLeaderboardCard } from "@/components/goal/GoalLeaderboardCard";
import { GoalParticipantsList } from "@/components/goal/GoalParticipantsList";
import { GoalPendingInvitesList } from "@/components/goal/GoalPendingInvitesList";
import { GoalPointsChart } from "@/components/goal/GoalPointsChart";
import { GoalStatsCard } from "@/components/goal/GoalStatsCard";
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
	goalKeys,
	useGoal,
	useGoalCompletions,
	useGoalLeaderboard,
	useGoalMonthlyPoints,
	useGoalMonthlyPointsForAll,
	useGoalPendingInvites,
	useGoalStreak,
	useRecentAttachments,
	useTodayCompletion,
	useTodaysCompletionsForGoals,
} from "@/hooks/goal/useGoalQueries";
import { useProfilesByIds } from "@/hooks/profile/useProfileHooks";
import type { AttachmentData } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { getNextDueDate, isTodayUTC } from "@/utils/date.utils";
import { getErrorMessage, showAlert } from "@/utils/error.utils";

export default function GoalDetailsModal() {
	const { id, inviteId, participantId } = useLocalSearchParams<{
		id: string;
		inviteId?: string;
		participantId?: string;
	}>();
	const goalId = Array.isArray(id) ? id[0] : id;
	const currentUserId = useAuthStore((state) => state.user?.id);
	// If participantId is provided, we're viewing another participant's data
	const viewUserId = participantId || currentUserId;
	const isViewingOther = !!participantId && participantId !== currentUserId;
	const queryClient = useQueryClient();
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const { width: screenWidth } = useWindowDimensions();
	const isWideScreen = screenWidth >= 768;
	const { data: goal, isLoading, error } = useGoal(goalId as string);
	const {
		data: todayCompletion,
		refetch: refetchToday,
		isLoading: isTodayCompletionLoading,
	} = useTodayCompletion(goalId as string, viewUserId);
	const { data: completions } = useGoalCompletions(
		goalId as string,
		viewUserId,
	);
	const { data: streak, isLoading: isStreakLoading } = useGoalStreak(
		goalId as string,
		viewUserId,
	);
	const { data: monthlyPoints, isLoading: isMonthlyPointsLoading } =
		useGoalMonthlyPoints(goalId as string, viewUserId);
	const { data: leaderboard = [], isLoading: isLeaderboardLoading } =
		useGoalLeaderboard(goalId as string);
	const { data: monthlyPointsAll = [], isLoading: isMonthlyPointsAllLoading } =
		useGoalMonthlyPointsForAll(goalId as string);
	const { data: attachments = [], isLoading: isAttachmentsLoading } =
		useRecentAttachments(goalId as string, 5);
	const { data: pendingInvites = [] } = useGoalPendingInvites(goalId as string);
	const { data: todaysCompletions } = useTodaysCompletionsForGoals(
		goalId ? [goalId] : [],
	);

	const attachmentSheetRef = useRef<AttachmentBottomSheetRef>(null);

	const acceptInviteMutation = useAcceptInvite();
	const declineInviteMutation = useDeclineInvite();
	const completeMutation = useCompleteGoal();
	const uncompleteMutation = useUncompleteGoal();
	const updateAttachmentMutation = useUpdateCompletion();

	const filteredAttachments = useMemo(() => {
		if (!participantId) return attachments;
		// When viewing a specific participant, show only their attachments
		return attachments.filter((a) => a.user_id === participantId);
	}, [attachments, participantId]);

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

	const participant = goal?.goal_participants.find(
		(p) => p.user_id === viewUserId,
	);
	const currentUserParticipant = goal?.goal_participants.find(
		(p) => p.user_id === currentUserId,
	);
	const isParticipant = !!currentUserParticipant;
	const isPersonalGoal = goal.goal_participants.length <= 1;
	const nextDueDate =
		currentUserId && isParticipant ? getNextDueDate(goal, currentUserId) : null;
	const isDueToday = nextDueDate ? isTodayUTC(nextDueDate) : false;

	const handleAcceptInvite = async () => {
		if (!inviteId || !goalId) return;
		try {
			await acceptInviteMutation.mutateAsync({
				inviteId,
				userId: currentUserId as string,
				goalId,
			});
			queryClient.removeQueries({
				queryKey: goalKeys.detail(goalId),
				exact: true,
			});
			router.push(`/app/goal/edit/${goalId}`);
		} catch (e) {
			showAlert(getErrorMessage(e, "Failed to accept invite"));
		}
	};

	const handleDeclineInvite = async () => {
		if (!inviteId) return;
		try {
			await declineInviteMutation.mutateAsync({
				inviteId,
				userId: currentUserId as string,
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

		if (!currentUserId) return;
		try {
			await completeMutation.mutateAsync({
				goalId: goal.id,
				userId: currentUserId,
				attachmentData,
			});
			refetchToday();
		} catch (e) {
			showAlert(getErrorMessage(e, "Failed to complete goal"));
		}
	};

	const handleUncomplete = async () => {
		if (!currentUserId) return;
		try {
			await uncompleteMutation.mutateAsync({
				goalId: goal.id,
				userId: currentUserId,
			});
			refetchToday();
		} catch (e) {
			showAlert(getErrorMessage(e, "Failed to uncomplete goal"));
		}
	};

	const currentUserLeaderboardEntry = leaderboard.find(
		(entry) => entry.user_id === viewUserId,
	);
	const rank = currentUserLeaderboardEntry?.rank ?? null;
	const statsLoading = isStreakLoading || isMonthlyPointsLoading;
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
	const isOwner = goal.owner_id === currentUserId;
	const isCompletedToday = !!todayCompletion?.id;
	const isInviteState = !!inviteId && !isParticipant;
	// When viewing another participant, hide the action buttons
	const showPrimaryAction =
		(isInviteState || (isParticipant && isDueToday)) && !isViewingOther;
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
				<View className="w-full max-w-4xl self-center gap-6">
					<GoalDetailHeader
						goal={goal}
						goalId={goalId as string}
						isParticipant={isParticipant}
						isViewingOther={isViewingOther}
						viewUserName={
							viewUserId
								? profileMap.get(viewUserId)?.nickname ||
									profileMap.get(viewUserId)?.username
								: undefined
						}
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

					{isParticipant ? (
						<GoalStatsCard
							streak={streak}
							points={monthlyPoints}
							rank={rank}
							loading={statsLoading}
							showRank={!isPersonalGoal}
						/>
					) : null}

					{isParticipant && !isPersonalGoal && !isViewingOther ? (
						<GoalLeaderboardCard
							leaderboard={leaderboard}
							currentUserId={currentUserId}
							loading={isLeaderboardLoading}
						/>
					) : null}

					{isWideScreen ? (
						<View className="flex-row gap-4">
							{isParticipant && !isPersonalGoal && !isViewingOther && (
								<View className="flex-1" style={{ height: 320 }}>
									<GoalPointsChart
										data={monthlyPointsAll}
										loading={isMonthlyPointsAllLoading}
									/>
								</View>
							)}
							{isViewingOther && !isPersonalGoal && viewUserId && (
								<View className="flex-1" style={{ height: 320 }}>
									<GoalPointsChart
										data={monthlyPointsAll.filter(
											(p) => p.user_id === viewUserId,
										)}
										loading={isMonthlyPointsAllLoading}
									/>
								</View>
							)}
							{!isInviteState && (
								<View className="flex-1" style={{ height: 320 }}>
									<GoalConsistencyHeatmap
										completedDates={completedDateKeys}
										frequencyType={goal.frequency_type}
										frequencyValue={goal.frequency_value}
										startDate={goal.start_date}
										weeklyDays={goal.weekly_days}
									/>
								</View>
							)}
						</View>
					) : (
						<>
							{isParticipant && !isPersonalGoal && !isViewingOther ? (
								<GoalPointsChart
									data={monthlyPointsAll}
									loading={isMonthlyPointsAllLoading}
								/>
							) : null}

							{isViewingOther && !isPersonalGoal && viewUserId && (
								<GoalPointsChart
									data={monthlyPointsAll.filter(
										(p) => p.user_id === viewUserId,
									)}
									loading={isMonthlyPointsAllLoading}
								/>
							)}

							{!isInviteState && (
								<GoalConsistencyHeatmap
									completedDates={completedDateKeys}
									frequencyType={goal.frequency_type}
									frequencyValue={goal.frequency_value}
									startDate={goal.start_date}
									weeklyDays={goal.weekly_days}
								/>
							)}
						</>
					)}

					{(isParticipant || isInviteState) && (
						<GoalParticipantsList
							participants={participantItems}
							goalId={goalId as string}
							currentUserId={currentUserId}
						/>
					)}

					{!isViewingOther && (
						<GoalAttachmentsList
							attachments={filteredAttachments}
							loading={isAttachmentsLoading}
						/>
					)}

					{!isViewingOther && isOwner && pendingInvites.length > 0 && (
						<GoalPendingInvitesList invites={pendingInvites} />
					)}
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

			{goal && !isViewingOther && (
				<AttachmentBottomSheet
					ref={attachmentSheetRef}
					goal={goal}
					onComplete={async (attachmentData) => {
						if (!currentUserId) return;
						try {
							if (goal.require_attachment) {
								await completeMutation.mutateAsync({
									goalId: goal.id,
									userId: currentUserId,
									attachmentData,
								});
							} else if (attachmentData) {
								await updateAttachmentMutation.mutateAsync({
									goalId: goal.id,
									userId: currentUserId,
									attachmentData,
								});
							}
							refetchToday();
						} catch (e) {
							showAlert(getErrorMessage(e, "Failed to update completion"));
						}
					}}
				/>
			)}
		</Screen>
	);
}
