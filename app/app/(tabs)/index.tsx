import { type Href, router } from "expo-router";
import { useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Button,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import AttachmentBottomSheet, {
	type AttachmentBottomSheetRef,
} from "@/components/AttachmentBottomSheet";
import { Screen } from "@/components/layout/Screen";
import {
	useCompleteGoal,
	useUncompleteGoal,
} from "@/hooks/goal/useGoalMutations";
import { useGoals, useTodaysCompletions } from "@/hooks/goal/useGoalQueries";
import { useGroupedGoals } from "@/hooks/goal/useGroupedGoals";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";

export default function HomeScreen() {
	const { user } = useAuthStore();
	const userId = user?.id;

	const [selectedGoal, setSelectedGoal] = useState<GoalWithParticipant | null>(
		null,
	);
	const attachmentSheetRef = useRef<AttachmentBottomSheetRef>(null);

	const {
		data: goals,
		isLoading: isGoalsLoading,
		error: goalsError,
	} = useGoals();

	const { data: todaysCompletions, isLoading: isCompletionsLoading } =
		useTodaysCompletions(userId);

	const completeMutation = useCompleteGoal();

	const groupedGoals = useGroupedGoals(goals, userId, todaysCompletions);

	const isLoading = isGoalsLoading || isCompletionsLoading;

	const handleOpenAttachment = (goal: GoalWithParticipant) => {
		setSelectedGoal(goal);
		attachmentSheetRef.current?.present();
	};

	return (
		<Screen className="px-6 py-4">
			<ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4 pb-10">
				<Button
					title="NEW GOAL"
					onPress={() => router.push("/app/goal/new" as Href)}
				/>

				{isLoading && <Text>Loading goals...</Text>}
				{goalsError && (
					<Text className="text-red-500">Failed to load goals</Text>
				)}

				{!isLoading && goals?.length === 0 && (
					<Text className="text-neutral-500 mt-10">
						You don't have any goals yet
					</Text>
				)}

				{groupedGoals.today.length > 0 && (
					<View className="w-full items-center gap-2">
						<Text className="text-xl font-bold text-neutral-800">Today</Text>
						{groupedGoals.today.map((goal) => (
							<GoalItem
								key={goal.id}
								goal={goal}
								canComplete
								userId={userId}
								isCompleted={goal.isCompleted}
								onRequireAttachment={handleOpenAttachment}
							/>
						))}
					</View>
				)}

				{groupedGoals.upcoming.length > 0 && (
					<View className="w-full items-center gap-2">
						<Text className="text-xl font-bold text-neutral-800">Upcoming</Text>
						{groupedGoals.upcoming.map((goal) => (
							<GoalItem
								key={goal.id}
								goal={goal}
								subtitle={`in ${goal.daysUntil} ${goal.daysUntil === 1 ? "day" : "days"}`}
							/>
						))}
					</View>
				)}
			</ScrollView>

			{selectedGoal && (
				<AttachmentBottomSheet
					ref={attachmentSheetRef}
					goal={selectedGoal}
					onComplete={async (attachmentData) => {
						if (!userId) return;
						await completeMutation.mutateAsync({
							goalId: selectedGoal.id,
							userId,
							attachmentData,
						});
					}}
				/>
			)}
		</Screen>
	);
}

function GoalItem({
	goal,
	subtitle,
	canComplete,
	userId,
	isCompleted,
	onRequireAttachment,
}: {
	goal: GoalWithParticipant;
	subtitle?: string;
	canComplete?: boolean;
	userId?: string;
	isCompleted?: boolean;
	onRequireAttachment?: (goal: GoalWithParticipant) => void;
}) {
	const completeMutation = useCompleteGoal();
	const uncompleteMutation = useUncompleteGoal();

	const handleToggle = async () => {
		if (!userId) return;
		if (
			!isCompleted &&
			goal.attachment_type !== "none" &&
			goal.require_attachment
		) {
			onRequireAttachment?.(goal);
			return;
		}

		try {
			if (isCompleted) {
				await uncompleteMutation.mutateAsync({ goalId: goal.id, userId });
			} else {
				await completeMutation.mutateAsync({ goalId: goal.id, userId });
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update completion";
			if (Platform.OS === "web") {
				window.alert(errorMessage);
			} else {
				Alert.alert("Error", errorMessage);
			}
		}
	};

	const isPending = completeMutation.isPending || uncompleteMutation.isPending;

	return (
		<View className="flex-row items-center border-b border-neutral-200">
			<Pressable
				className="flex-1 py-3 items-center"
				onPress={() => router.push(`/app/goal/${goal.id}` as Href)}
			>
				<Text
					className={`text-lg ${
						isCompleted ? "text-neutral-400 line-through" : "text-neutral-800"
					}`}
				>
					{goal.title}
				</Text>
				{subtitle && (
					<Text className="text-sm text-neutral-500">{subtitle}</Text>
				)}
			</Pressable>

			{canComplete && userId && (
				<Pressable onPress={handleToggle} disabled={isPending} className="p-3">
					{isPending ? (
						<ActivityIndicator size="small" color="#000" />
					) : (
						<View className="flex-row items-center gap-2">
							{!isCompleted &&
								goal.attachment_type !== "none" &&
								goal.require_attachment && (
									<Text className="text-[10px] text-blue-500 uppercase font-bold">
										Proof
									</Text>
								)}
							<View
								className={`w-7 h-7 rounded-full border-2 border-black items-center justify-center ${
									isCompleted ? "bg-black" : "bg-transparent"
								}`}
							>
								{isCompleted && (
									<Text className="text-white text-xs font-bold">✓</Text>
								)}
							</View>
						</View>
					)}
				</Pressable>
			)}
		</View>
	);
}
