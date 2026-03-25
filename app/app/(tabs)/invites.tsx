import { Alert, Button, Platform, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { useAcceptInvite } from "@/hooks/goal/useAcceptInvite";
import { useDeclineInvite } from "@/hooks/goal/useDeclineInvite";
import { useInvites } from "@/hooks/goal/useInvites";
import { useAuthStore } from "@/lib/store/auth.store";

export default function InvitesScreen() {
	const { user } = useAuthStore();
	const userId = user?.id;

	const { data: invites, isLoading, error } = useInvites(userId);
	const acceptInviteMutation = useAcceptInvite(userId);
	const declineInviteMutation = useDeclineInvite(userId);

	const handleAccept = async (inviteId: string, goalId: string) => {
		try {
			await acceptInviteMutation.mutateAsync(inviteId);
			router.push(`/app/goal/${goalId}`);
		} catch (_e) {
			const errorMessage = "Failed to accept invite";
			if (Platform.OS === "web") {
				window.alert(errorMessage);
			} else {
				Alert.alert("Error", errorMessage);
			}
		}
	};

	const handleDecline = async (inviteId: string) => {
		try {
			await declineInviteMutation.mutateAsync(inviteId);
		} catch (_e) {
			const errorMessage = "Failed to decline invite";
			if (Platform.OS === "web") {
				window.alert(errorMessage);
			} else {
				Alert.alert("Error", errorMessage);
			}
		}
	};

	return (
		<Screen className="px-6 py-4">
			<ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4">
				{isLoading && <Text>Loading invites...</Text>}
				{error && <Text className="text-red-500">Failed to load invites</Text>}

				{invites?.length === 0 && (
					<Text>You don't have any pending invites</Text>
				)}

				{invites?.map((invite) => (
					<View
						key={invite.id}
						className="py-3 border-b border-neutral-200 w-full items-center"
					>
						<Text className="text-lg font-bold">{invite.goal.title}</Text>
						<Text className="text-sm text-neutral-500 mb-2">
							Invited by: {invite.inviter.username}
						</Text>
						<Text className="text-sm mb-2">
							{invite.goal.frequency_type === "interval"
								? `Every ${invite.goal.frequency_value} days`
								: `${invite.goal.frequency_value} days per week`}
						</Text>
						<View className="flex-row gap-4 mt-2">
							<Button
								title="Decline"
								color="red"
								onPress={() => handleDecline(invite.id)}
								disabled={
									declineInviteMutation.isPending ||
									acceptInviteMutation.isPending
								}
							/>
							<Button
								title="Accept"
								onPress={() => handleAccept(invite.id, invite.goal_id)}
								disabled={
									declineInviteMutation.isPending ||
									acceptInviteMutation.isPending
								}
							/>
							<Button
								title="Preview"
								onPress={() =>
									router.push(
										`/app/goal/${invite.goal_id}?inviteId=${invite.id}`,
									)
								}
							/>
						</View>
					</View>
				))}
			</ScrollView>
		</Screen>
	);
}
