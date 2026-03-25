import { Image } from "expo-image";
import { type Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
	Alert,
	Button,
	Linking,
	Platform,
	ScrollView,
	Text,
	View,
} from "react-native";
import AttachmentBottomSheet, {
	type AttachmentBottomSheetRef,
} from "@/components/AttachmentBottomSheet";
import { Screen } from "@/components/layout/Screen";
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
import { getSignedUrl } from "@/services/goal.service";
import { useAuthStore } from "@/store/auth.store";
import { formatToISODate } from "@/utils/date.utils";

function SignedImage({ path }: { path: string }) {
	const [signedUrl, setSignedUrl] = useState<string | null>(null);

	useEffect(() => {
		getSignedUrl(path).then(setSignedUrl);
	}, [path]);

	if (!signedUrl) return <View className="w-20 h-20 bg-neutral-200" />;

	return <Image source={{ uri: signedUrl }} className="w-20 h-20 mt-1" />;
}

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
				<Text>Loading details...</Text>
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
	const participant = goal.goal_participants?.find((p) => p.user_id === userId);

	const handleAcceptInvite = async () => {
		if (!inviteId) return;
		try {
			await acceptInviteMutation.mutateAsync({
				inviteId,
				userId: userId as string,
			});

			router.setParams({ inviteId: undefined });
		} catch (_e) {
			const errorMessage = "Failed to accept invite";
			if (Platform.OS === "web") {
				window.alert(errorMessage);
			} else {
				Alert.alert("Error", errorMessage);
			}
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
		} catch (_e) {
			const errorMessage = "Failed to decline invite";
			if (Platform.OS === "web") {
				window.alert(errorMessage);
			} else {
				Alert.alert("Error", errorMessage);
			}
		}
	};

	const handleComplete = async (attachmentData?: AttachmentData) => {
		if (goal.require_attachment && !attachmentData) {
			attachmentSheetRef.current?.present();
			return;
		}

		if (!userId) return;
		await completeMutation.mutateAsync({
			goalId: goal.id,
			userId,
			attachmentData,
		});
		refetchToday();
	};

	const handleUncomplete = async () => {
		if (!userId) return;
		await uncompleteMutation.mutateAsync({ goalId: goal.id, userId });
		refetchToday();
	};

	const handleAddAttachment = () => {
		attachmentSheetRef.current?.present();
	};

	return (
		<Screen className="px-6 py-4">
			<ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4 pb-10">
				<Text>Title: {goal.title}</Text>
				<Text>Description: {goal.description || "No description"}</Text>

				<Text>Frequency: {goal.frequency_type}</Text>
				{goal.frequency_type === "interval" && (
					<Text>Every: {goal.frequency_value} days</Text>
				)}
				{goal.frequency_type === "weekly" && (
					<Text>Days per week: {goal.frequency_value}</Text>
				)}

				{participant && (
					<>
						{goal.frequency_type === "interval" && participant.anchor_date && (
							<Text>
								Anchor Date:{" "}
								{formatToISODate(new Date(participant.anchor_date))}
							</Text>
						)}
						{goal.frequency_type === "weekly" && participant.weekly_days && (
							<Text>Days of week: {participant.weekly_days.join(", ")}</Text>
						)}

						{!streakLoading && streak !== undefined && (
							<Text>Streak: {streak}</Text>
						)}

						{!pointsLoading && (
							<Text>Points this month: {monthlyPoints ?? "unknown"}</Text>
						)}
					</>
				)}

				<View className="mt-8 w-full max-w-xs gap-4">
					{isParticipant && (
						<>
							{goal.attachment_type === "none" && (
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

							{goal.attachment_type !== "none" &&
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

				{isParticipant && completions && completions.length > 0 && (
					<View className="mt-8 w-full">
						<Text className="text-xl font-bold mb-2 text-center">
							Past Completions
						</Text>
						{completions.map((comp) => (
							<View
								key={comp.id}
								className="border-b border-neutral-200 py-3 items-center"
							>
								<Text>
									Date: {new Date(comp.completed_at).toLocaleDateString()}
								</Text>
								<Text>Points: {comp.points_earned}</Text>
								{comp.attachment_data && (
									<View className="mt-2 items-center">
										{comp.attachment_data.type === "photo" && (
											<SignedImage path={comp.attachment_data.path} />
										)}
										{comp.attachment_data.type === "url" && (
											<Text
												className="text-blue-500"
												onPress={() =>
													Linking.openURL(comp.attachment_data.url)
												}
											>
												{comp.attachment_data.url}
											</Text>
										)}
										{comp.attachment_data.type === "text" && (
											<Text className="text-neutral-600 mt-1 italic">
												"{comp.attachment_data.content}"
											</Text>
										)}
									</View>
								)}
							</View>
						))}
					</View>
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
