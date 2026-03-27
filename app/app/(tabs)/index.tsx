import { type Href, router } from "expo-router";
import { useRef, useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";
import AttachmentBottomSheet, {
	type AttachmentBottomSheetRef,
} from "@/components/AttachmentBottomSheet";
import { GoalItem } from "@/components/goal/GoalItem";
import { Screen } from "@/components/layout/Screen";
import { ATTACHMENT_TYPES } from "@/constants/attachmentTypes";
import { useGoals, useTodaysCompletions } from "@/hooks/goal/useGoalQueries";
import { useGoalToggle } from "@/hooks/goal/useGoalToggle";
import { useGroupedGoals } from "@/hooks/goal/useGroupedGoals";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage, showAlert } from "@/utils/error.utils";

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

	const { toggleCompletion, pendingGoalId } = useGoalToggle(userId);

	const groupedGoals = useGroupedGoals(goals, userId, todaysCompletions);

	const isLoading = isGoalsLoading || isCompletionsLoading;

	const handleToggle = async (
		goal: GoalWithParticipant,
		isCompleted: boolean,
	) => {
		if (
			!isCompleted &&
			goal.attachment_type !== ATTACHMENT_TYPES.NONE &&
			goal.require_attachment
		) {
			setSelectedGoal(goal);
			attachmentSheetRef.current?.present();
			return;
		}

		try {
			await toggleCompletion(goal.id, isCompleted);
		} catch (error) {
			showAlert(getErrorMessage(error, "Failed to update completion"));
		}
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
								canComplete={!!userId}
								isCompleted={goal.isCompleted}
								isPending={pendingGoalId === goal.id}
								onToggle={() => handleToggle(goal, goal.isCompleted)}
								onPress={() => router.push(`/app/goal/${goal.id}` as Href)}
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
								onPress={() => router.push(`/app/goal/${goal.id}` as Href)}
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
						if (!userId || !selectedGoal) return;
						try {
							await toggleCompletion(selectedGoal.id, false, attachmentData);
						} catch {}
					}}
				/>
			)}
		</Screen>
	);
}
