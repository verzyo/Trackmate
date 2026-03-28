import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import { Screen } from "@/components/layout/Screen";
import Avatar from "@/components/ui/Avatar";
import {
	useAcceptInvite,
	useDeclineInvite,
} from "@/hooks/goal/useGoalMutations";
import { goalKeys, useInvites } from "@/hooks/goal/useGoalQueries";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage, showAlert } from "@/utils/error.utils";

export default function InvitesScreen() {
	const { user } = useAuthStore();
	const userId = user?.id;

	const { data: invites, isLoading, error } = useInvites(userId);
	const acceptInviteMutation = useAcceptInvite();
	const declineInviteMutation = useDeclineInvite();
	const queryClient = useQueryClient();
	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = useCallback(async () => {
		if (!userId) return;
		setRefreshing(true);
		try {
			await queryClient.refetchQueries({
				queryKey: goalKeys.invites(userId),
			});
		} finally {
			setRefreshing(false);
		}
	}, [queryClient, userId]);

	const handleAccept = async (inviteId: string, goalId: string) => {
		try {
			await acceptInviteMutation.mutateAsync({
				inviteId,
				userId: userId as string,
			});
			router.push(`/app/goal/${goalId}`);
		} catch (e) {
			showAlert(getErrorMessage(e, "Failed to accept invite"));
		}
	};

	const handleDecline = async (inviteId: string) => {
		try {
			await declineInviteMutation.mutateAsync({
				inviteId,
				userId: userId as string,
			});
		} catch (e) {
			showAlert(getErrorMessage(e, "Failed to decline invite"));
		}
	};

	return (
		<Screen className="bg-surface-bg">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerClassName="px-6 py-8 pb-20"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
			>
				<View className="flex-col gap-8">
					<View>
						<Text className="text-3xl font-bold tracking-tight text-text-strong">
							Invitations
						</Text>
						<Text className="text-lg font-medium text-text-light mt-1">
							Goals your friends want you to join
						</Text>
					</View>

					{isLoading && (
						<View className="py-20 items-center justify-center">
							<ActivityIndicator
								size="large"
								color="var(--color-action-primary)"
							/>
							<Text className="text-text-light mt-4 font-medium">
								Loading invites...
							</Text>
						</View>
					)}

					{error && (
						<View className="py-20 items-center justify-center">
							<Text className="text-state-danger font-bold text-center">
								Failed to load invites
							</Text>
						</View>
					)}

					{!isLoading && !error && invites?.length === 0 && (
						<View className="py-20 items-center justify-center bg-surface-fg rounded-3xl border border-border p-10">
							<Text className="text-text-light font-bold text-lg text-center">
								No pending invitations
							</Text>
							<Text className="text-text-light text-center mt-2">
								When friends invite you to goals, they'll appear here!
							</Text>
						</View>
					)}

					<View className="gap-4">
						{invites?.map((invite) => (
							<View
								key={invite.id}
								className="p-6 bg-surface-fg rounded-3xl border border-border gap-4"
							>
								<View className="flex-row items-center gap-4">
									<Avatar
										size={48}
										name={invite.inviter.username}
										imageUrl={invite.inviter.avatar_url ?? undefined}
									/>
									<View className="flex-1">
										<Text
											className="text-xl font-bold text-text-strong"
											numberOfLines={1}
										>
											{invite.goal.title}
										</Text>
										<Text className="text-sm font-medium text-text-light">
											from @{invite.inviter.username}
										</Text>
									</View>
								</View>

								<View className="bg-surface-bg/50 p-4 rounded-2xl">
									<Text className="text-text-default font-medium">
										{invite.goal.frequency_type === "interval"
											? `Every ${invite.goal.frequency_value} days`
											: `${invite.goal.frequency_value} days per week`}
									</Text>
									{invite.goal.description && (
										<Text
											className="text-text-light text-sm mt-1"
											numberOfLines={2}
										>
											{invite.goal.description}
										</Text>
									)}
								</View>

								<View className="flex-row gap-3">
									<Pressable
										onPress={() => handleAccept(invite.id, invite.goal_id)}
										disabled={
											acceptInviteMutation.isPending ||
											declineInviteMutation.isPending
										}
										className="flex-1 h-12 bg-action-primary rounded-xl items-center justify-center"
									>
										<Text className="text-white font-bold">Accept</Text>
									</Pressable>
									<Pressable
										onPress={() => handleDecline(invite.id)}
										disabled={
											acceptInviteMutation.isPending ||
											declineInviteMutation.isPending
										}
										className="flex-1 h-12 bg-state-danger/10 rounded-xl items-center justify-center"
									>
										<Text className="text-state-danger font-bold">Decline</Text>
									</Pressable>
									<Pressable
										onPress={() =>
											router.push(
												`/app/goal/${invite.goal_id}?inviteId=${invite.id}`,
											)
										}
										className="h-12 w-12 bg-surface-bg rounded-xl items-center justify-center border border-border"
									>
										<Text className="text-text-strong font-bold">...</Text>
									</Pressable>
								</View>
							</View>
						))}
					</View>
				</View>
			</ScrollView>
		</Screen>
	);
}
