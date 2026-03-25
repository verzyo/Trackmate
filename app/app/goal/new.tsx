import DateTimePicker, {
	type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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
import { useCreateGoal } from "@/hooks/goal/useCreateGoal";
import { useCreateInvite } from "@/hooks/goal/useCreateInvite";
import type { CreateGoalParams } from "@/lib/api/goal.api";
import { fetchProfileByUsername } from "@/lib/api/profile.api";
import { useAuthStore } from "@/lib/store/auth.store";

type GoalForm = {
	title: string;
	description: string;
	interval_days: string;
	weekly_days: string;
};

export default function NewGoalModal() {
	const { user } = useAuthStore();
	const userId = user?.id;

	const [frequencyType, setFrequencyType] = useState<"interval" | "weekly">(
		"interval",
	);
	const [anchorDate, setAnchorDate] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);

	const [inviteUsername, setInviteUsername] = useState("");
	const [pendingInvitees, setPendingInvitees] = useState<
		{ id: string; username: string }[]
	>([]);

	const createGoalMutation = useCreateGoal();
	const createInviteMutation = useCreateInvite();

	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<GoalForm>({
		defaultValues: {
			title: "",
			description: "",
			interval_days: "1",
			weekly_days: "1",
		},
	});

	const onChangeDate = (_event: DateTimePickerEvent, selectedDate?: Date) => {
		if (Platform.OS === "android") {
			setShowDatePicker(false);
		}

		const currentDate = selectedDate || anchorDate;
		setAnchorDate(currentDate);
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

	const onSubmit = async (data: GoalForm) => {
		try {
			let activeWeekly: number[] | null = null;
			if (frequencyType === "weekly") {
				const activeDays = data.weekly_days
					.split(",")
					.map((d) => parseInt(d.trim(), 10))
					.filter((d) => !Number.isNaN(d));

				const uniqueDays = Array.from(new Set(activeDays));
				if (uniqueDays.some((d) => d < 1 || d > 7)) {
					throw new Error(
						"Weekly days must be between 1 and 7 (1=Monday, 7=Sunday).",
					);
				}
				if (uniqueDays.length === 0) {
					throw new Error("Please specify at least one day for weekly goals.");
				}
				activeWeekly = uniqueDays;
			}

			let frequencyValue = 1;
			if (frequencyType === "interval") {
				frequencyValue = parseInt(data.interval_days, 10);
			} else if (frequencyType === "weekly" && activeWeekly) {
				frequencyValue = activeWeekly.length;
			}

			const params: CreateGoalParams = {
				title: data.title,
				description: data.description,
				frequency_type: frequencyType,
				frequency_value: frequencyValue,
				weekly_days: frequencyType === "weekly" ? activeWeekly : null,
				anchor_date:
					frequencyType === "interval" ? anchorDate.toISOString() : null,
			};

			const goalId = await createGoalMutation.mutateAsync(params);

			if (pendingInvitees.length > 0 && userId) {
				await Promise.all(
					pendingInvitees.map((invitee) =>
						createInviteMutation.mutateAsync({
							goalId: goalId as string,
							inviterId: userId,
							inviteeId: invitee.id,
						}),
					),
				);
			}

			router.back();
		} catch (error) {
			let errorMessage =
				error instanceof Error ? error.message : "Failed to create goal";

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
		createGoalMutation.isPending ||
		createInviteMutation.isPending;

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

				<Text className="mt-4">Frequency Type*</Text>
				<View className="flex-row gap-4 mb-2">
					<Button
						title="Interval"
						color={frequencyType === "interval" ? "#007AFF" : "gray"}
						onPress={() => setFrequencyType("interval")}
					/>
					<Button
						title="Weekly"
						color={frequencyType === "weekly" ? "#007AFF" : "gray"}
						onPress={() => setFrequencyType("weekly")}
					/>
				</View>

				{frequencyType === "interval" && (
					<>
						<Text>Every X Days*</Text>
						<Controller
							control={control}
							name="interval_days"
							render={({ field: { onChange, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									keyboardType="number-pad"
									placeholder="e.g. 1 for everyday"
									className="text-center"
								/>
							)}
						/>
					</>
				)}

				{frequencyType === "weekly" && (
					<>
						<Text>Days of the Week (1=Mon, 7=Sun)*</Text>
						<Controller
							control={control}
							name="weekly_days"
							render={({ field: { onChange, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									placeholder="e.g. 1, 3, 5"
									className="text-center"
								/>
							)}
						/>
					</>
				)}

				{frequencyType === "interval" && (
					<>
						<Text className="mt-4">Anchor Date*</Text>
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

				<View className="h-[1px] bg-gray-300 w-full my-4" />

				<View className="w-full items-center">
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

				<View className="mt-8 mb-6">
					<Button
						title={isLoading ? "Creating..." : "Create Goal"}
						onPress={handleSubmit(onSubmit)}
						disabled={isLoading}
					/>
				</View>
			</ScrollView>
		</Screen>
	);
}
