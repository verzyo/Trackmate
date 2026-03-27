import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Button,
	ScrollView,
	Text,
	View,
} from "react-native";
import { ZodError } from "zod";
import { FormField } from "@/components/forms/FormField";
import { InviteManager } from "@/components/forms/InviteManager";
import { GoalScheduleEditor } from "@/components/goal/GoalScheduleEditor";
import { Screen } from "@/components/layout/Screen";
import { FREQUENCY_TYPES } from "@/constants/frequencyTypes";
import { useToday } from "@/hooks/common/useToday";
import {
	useCreateInvite,
	useDeleteGoal,
	useLeaveGoal,
	useUpdateGoalMetadata,
} from "@/hooks/goal/useGoalMutations";
import { useGoal, useGoalCompletions } from "@/hooks/goal/useGoalQueries";
import { useInviteManagement } from "@/hooks/goal/useInviteManagement";
import { createWeeklyDaysSchema } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { formatToISODate } from "@/utils/date.utils";
import { showAlert } from "@/utils/error.utils";

type GoalForm = {
	title: string;
	description: string;
};

export default function EditGoalModal() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: goal, isLoading: isGoalLoading } = useGoal(id as string);
	const updateMetadataMutation = useUpdateGoalMetadata();
	const deleteGoalMutation = useDeleteGoal();
	const createInviteMutation = useCreateInvite();
	const leaveGoalMutation = useLeaveGoal();

	const { user } = useAuthStore();
	const userId = user?.id;

	const isOwner = goal?.owner_id === userId;

	const { data: completions } = useGoalCompletions(id as string, userId);
	const hasCompletions = (completions?.length ?? 0) > 0;

	const today = useToday();

	const { invitees, addInvite, removeInvite } = useInviteManagement(
		userId,
		goal?.goal_participants.map((p) => p.user_id),
	);

	const [startDate, setStartDate] = useState(today);
	const [weeklyDaysInput, setWeeklyDaysInput] = useState("1");

	const [initialStartDate, setInitialStartDate] = useState<Date | null>(null);
	const [initialWeeklyDays, setInitialWeeklyDays] = useState<string | null>(
		null,
	);

	const { control, handleSubmit, reset } = useForm<GoalForm>({
		defaultValues: {
			title: "",
			description: "",
		},
	});

	useEffect(() => {
		if (goal) {
			if (goal.start_date) {
				const date = new Date(goal.start_date);
				const utcDate = new Date(
					Date.UTC(
						date.getUTCFullYear(),
						date.getUTCMonth(),
						date.getUTCDate(),
					),
				);
				setStartDate(utcDate);
				setInitialStartDate(utcDate);
			}
			if (goal.weekly_days) {
				const days = goal.weekly_days.join(", ");
				setWeeklyDaysInput(days);
				setInitialWeeklyDays(days);
			}
			reset({
				title: goal.title,
				description: goal.description || "",
			});
		}
	}, [goal, reset]);

	const onSave = async (data: GoalForm) => {
		try {
			const metadataParams: Record<string, unknown> = {
				goal_id: id as string,
			};
			let hasChanges = false;

			if (isOwner) {
				if (data.title !== goal?.title) {
					metadataParams.title = data.title;
					hasChanges = true;
				}
				if (data.description !== (goal?.description || "")) {
					metadataParams.description = data.description;
					hasChanges = true;
				}

				if (!hasCompletions) {
					if (
						initialStartDate === null ||
						startDate.getTime() !== initialStartDate.getTime()
					) {
						metadataParams.start_date = formatToISODate(startDate);
						hasChanges = true;
					}

					if (goal?.frequency_type === FREQUENCY_TYPES.WEEKLY) {
						if (weeklyDaysInput !== (initialWeeklyDays ?? "")) {
							const uniqueDays = createWeeklyDaysSchema(
								goal.frequency_value,
							).parse(weeklyDaysInput);
							metadataParams.weekly_days = uniqueDays;
							hasChanges = true;
						}
					}
				}
			}

			const invitePromises = [];
			if (invitees.length > 0 && userId) {
				invitePromises.push(
					...invitees.map((invitee) =>
						createInviteMutation.mutateAsync({
							goalId: id as string,
							inviterId: userId,
							inviteeId: invitee.id,
						}),
					),
				);
			}

			if (!hasChanges && invitePromises.length === 0) {
				router.back();
				return;
			}

			const promises = [...invitePromises];
			if (hasChanges) {
				promises.push(
					updateMetadataMutation.mutateAsync(
						metadataParams as {
							goal_id: string;
							title?: string;
							description?: string;
							start_date?: string;
							weekly_days?: number[];
						},
					),
				);
			}

			await Promise.all(promises);
			router.back();
		} catch (error) {
			let errorMessage =
				error instanceof Error ? error.message : "Failed to update goal";
			if (error instanceof ZodError) {
				errorMessage = error.issues[0].message;
			}
			showAlert(errorMessage);
		}
	};

	const isSaving =
		updateMetadataMutation.isPending || createInviteMutation.isPending;

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
			showAlert("Failed to delete goal");
		}
	};

	const handleLeave = async () => {
		if (!userId) return;
		try {
			await leaveGoalMutation.mutateAsync(id as string);
			router.dismissAll();
		} catch (_e) {
			showAlert("Failed to leave goal");
		}
	};

	return (
		<Screen className="px-6 py-4">
			<ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4">
				{isOwner && (
					<>
						<FormField
							control={control}
							name="title"
							label="Title*"
							placeholder="e.g. Morning Run"
							className="text-center w-full"
						/>

						<FormField
							control={control}
							name="description"
							label="Description"
							placeholder="Optional details"
							className="text-center w-full"
						/>
					</>
				)}

				<View className="h-[1px] bg-gray-300 w-full my-4" />

				<Text className="font-bold text-lg">Frequency</Text>
				<Text>
					Type: <Text className="capitalize">{goal.frequency_type}</Text>
				</Text>
				<Text>
					Value:{" "}
					{goal.frequency_type === FREQUENCY_TYPES.INTERVAL
						? `${goal.frequency_value} days`
						: `${goal.frequency_value} days per week`}
				</Text>

				{isOwner && (
					<GoalScheduleEditor
						goal={goal}
						hasCompletions={hasCompletions}
						startDate={startDate}
						onStartDateChange={setStartDate}
						weeklyDaysInput={weeklyDaysInput}
						onWeeklyDaysChange={setWeeklyDaysInput}
					/>
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
					<InviteManager
						invitees={invitees}
						onAdd={addInvite}
						onRemove={removeInvite}
					/>
				)}

				<View className="mt-4 pb-10">
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
