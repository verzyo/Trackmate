import { Screen } from "@/components/layout/Screen";
import { useCreateInvite } from "@/hooks/goal/useCreateInvite";
import { useDeleteGoal } from "@/hooks/goal/useDeleteGoal";
import { useGoal } from "@/hooks/goal/useGoal";
import { useLeaveGoal } from "@/hooks/goal/useLeaveGoal";
import { useUpdateGoalMetadata } from "@/hooks/goal/useUpdateGoalMetadata";
import { useUpdateParticipantSettings } from "@/hooks/goal/useUpdateParticipantSettings";
import { fetchProfileByUsername } from "@/lib/api/profile.api";
import { useAuthStore } from "@/lib/store/auth.store";
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

type GoalForm = {
	title: string;
	description: string;
};

export default function EditGoalModal() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: goal, isLoading: isGoalLoading } = useGoal(id as string);
	const updateMetadataMutation = useUpdateGoalMetadata();
	const updateParticipantMutation = useUpdateParticipantSettings();
	const deleteGoalMutation = useDeleteGoal();
	const createInviteMutation = useCreateInvite();
	const leaveGoalMutation = useLeaveGoal();

	const { user } = useAuthStore();
	const userId = user?.id;

	const isOwner = goal?.owner_id === userId;

	const [inviteUsername, setInviteUsername] = useState("");
	const [pendingInvitees, setPendingInvitees] = useState<
		{ id: string; username: string }[]
	>([]);

	const [anchorDate, setAnchorDate] = useState(new Date());
	const [weeklyDaysInput, setWeeklyDaysInput] = useState("1");
	const [showDatePicker, setShowDatePicker] = useState(false);

	const [initialAnchorDate, setInitialAnchorDate] = useState<Date | null>(null);
	const [initialWeeklyDays, setInitialWeeklyDays] = useState<string | null>(
		null,
	);

	const {
		control,
		handleSubmit,
		reset,
	} = useForm<GoalForm>({
		defaultValues: {
			title: "",
			description: "",
		},
	});

	useEffect(() => {
		if (goal) {
			const myParticipant = goal.goal_participants?.find(
				(p) => p.user_id === userId,
			);
			if (myParticipant) {
				if (myParticipant.anchor_date) {
					const date = new Date(myParticipant.anchor_date);
					setAnchorDate(date);
					setInitialAnchorDate(date);
				}
				if (myParticipant.weekly_days) {
					const days = myParticipant.weekly_days.join(", ");
					setWeeklyDaysInput(days);
					setInitialWeeklyDays(days);
				}
			}
			reset({
				title: goal.title,
				description: goal.description || "",
			});
		}
	}, [goal, reset, userId]);

	const onChangeDate = (_event: DateTimePickerEvent, selectedDate?: Date) => {
		if (Platform.OS === "android") {
			setShowDatePicker(false);
		}
		if (selectedDate) setAnchorDate(selectedDate);
	};

	const onSave = async (data: GoalForm) => {
		try {
			const metadataPromises = [];
			const participantPromises = [];
			const invitePromises = [];

			if (isOwner) {
				const metadataParams: Record<string, unknown> = { goal_id: id as string };
				let hasMetadataChanges = false;
				if (data.title !== goal?.title) {
					metadataParams.title = data.title;
					hasMetadataChanges = true;
				}
				if (data.description !== (goal?.description || "")) {
					metadataParams.description = data.description;
					hasMetadataChanges = true;
				}
				if (hasMetadataChanges) {
					metadataPromises.push(
						updateMetadataMutation.mutateAsync(
							metadataParams as { goal_id: string; title?: string; description?: string }
						)
					);
				}
			}

			const participantParams: Record<string, unknown> = { goal_id: id as string };
			let hasParticipantChanges = false;

			if (goal?.frequency_type === "interval") {
				if (
					initialAnchorDate === null ||
					anchorDate.getTime() !== initialAnchorDate.getTime()
				) {
					participantParams.anchor_date = anchorDate.toISOString();
					hasParticipantChanges = true;
				}
			} else if (goal?.frequency_type === "weekly") {
				if (weeklyDaysInput !== (initialWeeklyDays ?? "")) {
					const days = weeklyDaysInput
						.split(",")
						.map((n) => Number(n.trim()))
						.filter((n) => !Number.isNaN(n) && n >= 1 && n <= 7);
					if (days.length > 0) {
						participantParams.weekly_days = days;
						hasParticipantChanges = true;
					}
				}
			}

			if (hasParticipantChanges) {
				participantPromises.push(
					updateParticipantMutation.mutateAsync(
						participantParams as {
							goal_id: string;
							anchor_date?: string;
							weekly_days?: number[];
						},
					),
				);
			}

			if (pendingInvitees.length > 0) {
				invitePromises.push(
					...pendingInvitees.map((invitee) =>
						createInviteMutation.mutateAsync({
							goalId: id as string,
							inviterId: userId!,
							inviteeId: invitee.id,
						}),
					),
				);
			}

			if (
				metadataPromises.length === 0 &&
				participantPromises.length === 0 &&
				invitePromises.length === 0
			) {
				router.back();
				return;
			}

			await Promise.all([
				...metadataPromises,
				...participantPromises,
				...invitePromises,
			]);
			router.back();
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update goal";
			if (Platform.OS === "web") {
				alert(errorMessage);
			} else {
				Alert.alert("Error", errorMessage);
			}
		}
	};

	const isSaving =
		updateMetadataMutation.isPending ||
		updateParticipantMutation.isPending ||
		createInviteMutation.isPending;

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

	const handleAddInvite = async () => {
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
			if (profile.id === userId) {
				const errorMessage = "You cannot invite yourself";
				if (Platform.OS === "web") {
					window.alert(errorMessage);
				} else {
					Alert.alert("Error", errorMessage);
				}
				return;
			}
			if (goal?.goal_participants.some((p) => p.user_id === profile.id)) {
				const errorMessage = "User is already a participant";
				if (Platform.OS === "web") {
					window.alert(errorMessage);
				} else {
					Alert.alert("Error", errorMessage);
				}
				return;
			}
			if (pendingInvitees.some((p) => p.id === profile.id)) {
				const errorMessage = "User already added to invites";
				if (Platform.OS === "web") {
					window.alert(errorMessage);
				} else {
					Alert.alert("Error", errorMessage);
				}
				return;
			}
			setPendingInvitees((prev) => [
				...prev,
				{ id: profile.id, username: profile.username },
			]);
			setInviteUsername("");
		} catch (_e) {
			const errorMessage = "Failed to find user";
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
				{isOwner && (
					<>
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
								/>
							)}
						/>
					</>
				)}

				<View className="h-[1px] bg-gray-300 w-full my-4" />

				<Text className="font-bold text-lg">Frequency</Text>

				<>
					<Text>
						Type: <Text className="capitalize">{goal.frequency_type}</Text>
					</Text>
					<Text>
						Value:{" "}
						{goal.frequency_type === "interval"
							? `${goal.frequency_value} days`
							: `${goal.frequency_value} days per week`}
					</Text>
				</>

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
					</>
				)}

				<View className="mt-4 mb-6 w-full max-w-xs">
					<Button
						title={isSaving ? "Saving..." : "Save Changes"}
						onPress={handleSubmit(onSave)}
						disabled={isSaving}
					/>
				</View>

				<View className="h-[1px] bg-gray-300 w-full my-4" />

				{isOwner && (
					<View className="mt-8 pt-4 w-full items-center">
						<Text className="font-bold text-lg">Invite Users</Text>
						<TextInput
							value={inviteUsername}
							onChangeText={setInviteUsername}
							placeholder="username"
							autoCapitalize="none"
							className="text-center mt-2 mb-4"
						/>
						<Button
							title="Add to Invites"
							onPress={handleAddInvite}
							disabled={!inviteUsername.trim()}
						/>

						{pendingInvitees.length > 0 && (
							<View className="mt-4 w-full px-4">
								<Text className="text-sm font-semibold mb-2 text-center">
									To be invited:
								</Text>
								{pendingInvitees.map((invitee) => (
									<View
										key={invitee.id}
										className="flex-row justify-between items-center py-2 border-b border-neutral-200"
									>
										<Text>{invitee.username}</Text>
										<Pressable
											onPress={() =>
												setPendingInvitees((prev) =>
													prev.filter((p) => p.id !== invitee.id),
												)
											}
										>
											<Text className="text-red-500 font-bold">REMOVE</Text>
										</Pressable>
									</View>
								))}
							</View>
						)}
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
							disabled={isSaving || deleteGoalMutation.isPending}
						/>
					) : (
						<Button
							title={leaveGoalMutation.isPending ? "Leaving..." : "Leave goal"}
							color="red"
							onPress={handleLeave}
							disabled={isSaving || leaveGoalMutation.isPending}
						/>
					)}
				</View>
			</ScrollView>
		</Screen>
	);
}
