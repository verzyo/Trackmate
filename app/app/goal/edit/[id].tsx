import DateTimePicker, {
	type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Alert,
	Button,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { Screen } from "@/components/layout/Screen";
import { useCreateInvite } from "@/hooks/goal/useCreateInvite";
import { useDeleteGoal } from "@/hooks/goal/useDeleteGoal";
import { useGoal } from "@/hooks/goal/useGoal";
import { useLeaveGoal } from "@/hooks/goal/useLeaveGoal";
import { useUpdateGoal } from "@/hooks/goal/useUpdateGoal";
import { useUpdateGoalParticipant } from "@/hooks/goal/useUpdateGoalParticipant";
import type { UpdateGoalParams } from "@/lib/api/goal.api";
import { fetchProfileByUsername } from "@/lib/api/profile.api";
import { useAuthStore } from "@/lib/store/auth.store";

type GoalForm = {
	title: string;
	description: string;
};

export default function EditGoalModal() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: goal, isLoading: isGoalLoading } = useGoal(id as string);
	const updateGoalMutation = useUpdateGoal();
	const updateParticipantMutation = useUpdateGoalParticipant();
	const deleteGoalMutation = useDeleteGoal();
	const createInviteMutation = useCreateInvite();
	const leaveGoalMutation = useLeaveGoal();

	const { user } = useAuthStore();
	const userId = user?.id;

	const isOwner = goal?.owner_id === userId;

	const [inviteUsername, setInviteUsername] = useState("");

	const [anchorDate, setAnchorDate] = useState(new Date());
	const [weeklyDaysInput, setWeeklyDaysInput] = useState("1");
	const [showDatePicker, setShowDatePicker] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<GoalForm>({
		defaultValues: {
			title: "",
			description: "",
		},
	});

	useEffect(() => {
		if (goal) {
			const participant = goal.goal_participants?.[0];
			if (participant) {
				if (participant.anchor_date) {
					setAnchorDate(new Date(participant.anchor_date));
				}
				if (participant.weekly_days) {
					setWeeklyDaysInput(participant.weekly_days.join(", "));
				}
			}
			reset({
				title: goal.title,
				description: goal.description || "",
			});
		}
	}, [goal, reset]);

	const onChangeDate = (_event: DateTimePickerEvent, selectedDate?: Date) => {
		if (Platform.OS === "android") {
			setShowDatePicker(false);
		}
		if (selectedDate) setAnchorDate(selectedDate);
	};

	const onSubmit = async (data: GoalForm) => {
		try {
			const params: UpdateGoalParams = {
				goal_id: id as string,
				title: data.title,
				description: data.description,
			};

			await updateGoalMutation.mutateAsync(params);
			router.back();
		} catch (error) {
			let errorMessage =
				error instanceof Error ? error.message : "Failed to update goal";

			if (errorMessage.includes("title_not_empty")) {
				errorMessage = "Goal title cannot be empty.";
			}

			if (Platform.OS === "web") {
				alert(errorMessage);
			} else {
				Alert.alert("Error", errorMessage);
			}
		}
	};

	const isLoading =
		isSubmitting ||
		updateGoalMutation.isPending ||
		updateParticipantMutation.isPending;

	if (isGoalLoading || !goal) {
		return (
			<Screen className="px-6 py-4 justify-center items-center">
				<ActivityIndicator size="large" />
			</Screen>
		);
	}

	const handleDelete = async () => {
		try {
			await deleteGoalMutation.mutateAsync(id as string);
			router.dismissAll();
		} catch (_e) {
			const errorMessage = "Failed to delete goal";
			if (Platform.OS === "web") {
				window.alert(errorMessage);
			} else {
				Alert.alert("Error", errorMessage);
			}
		}
	};

	const handleLeave = async () => {
		if (!userId) return;
		try {
			await leaveGoalMutation.mutateAsync(id as string);
			router.dismissAll();
		} catch (_e) {
			const errorMessage = "Failed to leave goal";
			if (Platform.OS === "web") {
				window.alert(errorMessage);
			} else {
				Alert.alert("Error", errorMessage);
			}
		}
	};

	const handleInvite = async () => {
		if (!inviteUsername.trim() || !userId) return;
		try {
			const profile = await fetchProfileByUsername(inviteUsername.trim());
			if (!profile) {
				const errorMessage = "User not found";
				if (Platform.OS === "web") {
					window.alert(errorMessage);
				} else {
					Alert.alert("Error", errorMessage);
				}
				return;
			}
			await createInviteMutation.mutateAsync({
				goalId: id as string,
				inviterId: userId,
				inviteeId: profile.id,
			});
			setInviteUsername("");
			const successMessage = "Invite sent!";
			if (Platform.OS === "web") {
				window.alert(successMessage);
			} else {
				Alert.alert("Success", successMessage);
			}
		} catch (_e) {
			const errorMessage = "Failed to send invite";
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
				<Text>Title*</Text>
				<Controller
					control={control}
					name="title"
					render={({ field: { onChange, value } }) => (
						<TextInput
							value={value}
							onChangeText={onChange}
							placeholder="e.g. Morning Run"
							className="text-center"
							editable={isOwner}
						/>
					)}
				/>

				<Text>Description</Text>
				<Controller
					control={control}
					name="description"
					render={({ field: { onChange, value } }) => (
						<TextInput
							value={value}
							onChangeText={onChange}
							placeholder="Optional details"
							className="text-center"
							editable={isOwner}
						/>
					)}
				/>

				{isOwner && (
					<View className="mt-2 mb-6">
						<Button
							title={
								updateGoalMutation.isPending ? "Updating..." : "Update Goal"
							}
							onPress={handleSubmit(onSubmit)}
							disabled={isLoading}
						/>
					</View>
				)}

				<View className="h-[1px] bg-gray-300 w-full my-4" />

				<Text className="font-bold text-lg">Frequency</Text>
				<Text>
					Type: <Text className="capitalize">{goal.frequency_type}</Text>
				</Text>
				<Text>
					Value:{" "}
					{goal.frequency_type === "interval"
						? `${goal.frequency_value} days`
						: `${goal.frequency_value} days per week`}
				</Text>

				<View className="h-[1px] bg-gray-300 w-full my-4" />

				<Text className="font-bold text-lg">My Settings</Text>

				{goal.frequency_type === "interval" && (
					<>
						<Text>My Anchor Date</Text>
						{Platform.OS === "web" ? (
							<View className="mb-4">
								<input
									type="date"
									value={anchorDate.toISOString().split("T")[0]}
									max={new Date().toISOString().split("T")[0]}
									onChange={(e) => {
										if (e.target.value) {
											const [year, month, day] = e.target.value
												.split("-")
												.map(Number);
											setAnchorDate(new Date(year, month - 1, day));
										}
									}}
									className="border-0 outline-none bg-transparent text-center"
								/>
							</View>
						) : (
							<Pressable
								onPress={() => setShowDatePicker(true)}
								className="p-3 mb-4"
							>
								<Text className="text-center text-blue-500">
									{anchorDate.toLocaleDateString()}
								</Text>
							</Pressable>
						)}

						{Platform.OS !== "web" && showDatePicker && (
							<DateTimePicker
								value={anchorDate}
								mode="date"
								display={"default"}
								maximumDate={new Date()}
								onChange={onChangeDate}
							/>
						)}
						<View className="mt-2 mb-4">
							<Button
								title={
									updateParticipantMutation.isPending
										? "Updating..."
										: "Update Anchor"
								}
								onPress={async () => {
									try {
										await updateParticipantMutation.mutateAsync({
											goalId: id as string,
											newAnchorDate: anchorDate.toISOString(),
											newWeeklyDays: null,
										});
										if (Platform.OS === "web") {
											alert("Updated successfully!");
										} else {
											Alert.alert("Success", "Updated successfully!");
										}
									} catch (_e) {
										if (Platform.OS === "web") {
											alert("Failed to update settings");
										} else {
											Alert.alert("Error", "Failed to update settings");
										}
									}
								}}
								disabled={isLoading}
							/>
						</View>
					</>
				)}

				{goal.frequency_type === "weekly" && (
					<>
						<Text>My Days of Week (1=Mon, 7=Sun)</Text>
						<TextInput
							value={weeklyDaysInput}
							onChangeText={setWeeklyDaysInput}
							placeholder="e.g. 1, 3, 5"
							className="text-center mb-4"
						/>
						<View className="mt-2 mb-4">
							<Button
								title={
									updateParticipantMutation.isPending
										? "Updating..."
										: "Update Days"
								}
								onPress={async () => {
									try {
										const days = weeklyDaysInput
											.split(",")
											.map((n) => Number(n.trim()))
											.filter((n) => !Number.isNaN(n) && n >= 1 && n <= 7);

										await updateParticipantMutation.mutateAsync({
											goalId: id as string,
											newAnchorDate: null,
											newWeeklyDays: days.length > 0 ? days : null,
										});
										if (Platform.OS === "web") {
											alert("Updated successfully!");
										} else {
											Alert.alert("Success", "Updated successfully!");
										}
									} catch (_e) {
										if (Platform.OS === "web") {
											alert("Failed to update settings");
										} else {
											Alert.alert("Error", "Failed to update settings");
										}
									}
								}}
								disabled={isLoading}
							/>
						</View>
					</>
				)}

				{isOwner && (
					<View className="mt-8 pt-4 w-full items-center">
						<Text>Invite User</Text>
						<TextInput
							value={inviteUsername}
							onChangeText={setInviteUsername}
							placeholder="username"
							autoCapitalize="none"
							className="text-center mt-2 mb-4"
						/>
						<Button
							title={createInviteMutation.isPending ? "Inviting..." : "Invite"}
							onPress={handleInvite}
							disabled={
								createInviteMutation.isPending || !inviteUsername.trim()
							}
						/>
					</View>
				)}

				<View className="mt-4">
					{isOwner ? (
						<Button
							title={
								deleteGoalMutation.isPending ? "Deleting..." : "Delete goal"
							}
							color="red"
							onPress={handleDelete}
							disabled={isLoading || deleteGoalMutation.isPending}
						/>
					) : (
						<Button
							title={leaveGoalMutation.isPending ? "Leaving..." : "Leave goal"}
							color="red"
							onPress={handleLeave}
							disabled={isLoading || leaveGoalMutation.isPending}
						/>
					)}
				</View>
			</ScrollView>
		</Screen>
	);
}
