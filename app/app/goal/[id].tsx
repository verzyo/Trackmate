import { type Href, router, useLocalSearchParams } from "expo-router";
import { Alert, Button, Platform, ScrollView, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { useGoal } from "@/hooks/goal/useGoal";
import { useAcceptInvite } from "@/hooks/goal/useAcceptInvite";
import { useDeclineInvite } from "@/hooks/goal/useDeclineInvite";
import { useAuthStore } from "@/lib/store/auth.store";

export default function GoalDetailsModal() {
	const { id, inviteId } = useLocalSearchParams<{
		id: string;
		inviteId?: string;
	}>();
	const userId = useAuthStore((state) => state.user?.id);
	const { data: goal, isLoading, error } = useGoal(id as string);

	const acceptInviteMutation = useAcceptInvite(userId);
	const declineInviteMutation = useDeclineInvite(userId);

	if (isLoading) {
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

	const participant = goal.goal_participants?.[0];
	const isParticipant = goal.goal_participants.some(
		(p) => p.user_id === userId,
	);

	const handleAcceptInvite = async () => {
		if (!inviteId) return;
		try {
			await acceptInviteMutation.mutateAsync(inviteId);
			router.back();
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
			await declineInviteMutation.mutateAsync(inviteId);
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

	return (
		<Screen className="px-6 py-4">
			<ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4">
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
								{new Date(participant.anchor_date).toLocaleDateString()}
							</Text>
						)}
						{goal.frequency_type === "weekly" && participant.weekly_days && (
							<Text>Days of week: {participant.weekly_days.join(", ")}</Text>
						)}
					</>
				)}

				<View className="mt-8 w-full max-w-xs">
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
			</ScrollView>
		</Screen>
	);
}
