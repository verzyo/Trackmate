import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InviteCard } from "@/components/goal/InviteCard";
import { Screen } from "@/components/layout/Screen";
import PageHeader from "@/components/ui/PageHeader";
import {
	useAcceptInvite,
	useDeclineInvite,
} from "@/hooks/goal/useGoalMutations";
import { goalKeys, useInvites } from "@/hooks/goal/useGoalQueries";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage, showAlert } from "@/utils/error.utils";

export default function InvitesScreen() {
	const insets = useSafeAreaInsets();
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

	const pendingActions =
		acceptInviteMutation.isPending || declineInviteMutation.isPending;

	return (
		<Screen className="bg-surface-bg">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerClassName="flex-grow px-6 py-8"
				contentContainerStyle={{
					paddingBottom: Math.max(insets.bottom + 16, 24),
				}}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
			>
				<View className="flex-1 w-full max-w-3xl self-center gap-8">
					<PageHeader title="Invitations" />

					{isLoading && (
						<View className="rounded-3xl border border-border bg-surface-fg py-16 items-center justify-center">
							<ActivityIndicator
								size="large"
								color="var(--color-action-primary)"
							/>
							<Text className="text-text-light mt-4 font-medium text-base">
								Loading invites...
							</Text>
						</View>
					)}

					{error && (
						<View className="rounded-3xl border border-border bg-surface-fg py-16 px-8 items-center justify-center">
							<Text className="text-state-danger font-bold text-center text-base">
								Failed to load invites
							</Text>
						</View>
					)}

					{!isLoading && !error && invites?.length === 0 && (
						<View className="rounded-3xl border border-border bg-surface-fg p-10 py-16 items-center justify-center">
							<Text className="text-text-strong font-bold text-lg text-center">
								No pending invitations
							</Text>
							<Text className="text-text-light text-center mt-2 text-base">
								When friends invite you to goals, they'll appear here!
							</Text>
						</View>
					)}

					<View className="gap-3">
						{invites?.map((invite) => (
							<InviteCard
								key={invite.id}
								invite={invite}
								onAccept={() => handleAccept(invite.id, invite.goal_id)}
								onDecline={() => handleDecline(invite.id)}
								onViewDetails={() =>
									router.push(
										`/app/goal/${invite.goal_id}?inviteId=${invite.id}`,
									)
								}
								disabled={pendingActions}
							/>
						))}
					</View>
				</View>
			</ScrollView>
		</Screen>
	);
}
