import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { type Href, router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import AttachmentBottomSheet, {
	type AttachmentBottomSheetRef,
} from "@/components/AttachmentBottomSheet";
import GreetingHeader from "@/components/GreetingHeader";
import { TodaySection } from "@/components/goal/TodaySection";
import { UpcomingSection } from "@/components/goal/UpcomingSection";
import { Screen } from "@/components/layout/Screen";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import { ATTACHMENT_TYPES } from "@/constants/attachmentTypes";
import { useErrorHandler } from "@/hooks/common/useErrorHandler";
import { goalKeys } from "@/hooks/goal/useGoalQueries";
import { useGoalToggle } from "@/hooks/goal/useGoalToggle";
import { useHomeData } from "@/hooks/goal/useHomeData";
import { usePrefetchGoals } from "@/hooks/goal/usePrefetchGoals";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { getCurrentDayString } from "@/utils/date.utils";

const getGreeting = () => {
	const h = new Date().getHours();
	if (h < 12) return "Good morning";
	if (h < 18) return "Good afternoon";
	return "Good evening";
};

export default function HomeScreen() {
	const navigation =
		useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
	const { user } = useAuthStore();
	const userId = user?.id;
	const { handleError } = useErrorHandler();

	const [selectedGoal, setSelectedGoal] = useState<GoalWithParticipant | null>(
		null,
	);
	const attachmentSheetRef = useRef<AttachmentBottomSheetRef>(null);

	const queryClient = useQueryClient();

	const [refreshing, setRefreshing] = useState(false);

	const {
		goals,
		groupedGoals,
		profileName,
		avatarUrl,
		invites,
		participantAvatars,
		isLoading,
		error,
	} = useHomeData(userId);

	usePrefetchGoals(goals, userId);

	const inviteCount = invites?.length ?? 0;
	const { toggleCompletion } = useGoalToggle(userId);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: goalKeys.all }),
				queryClient.invalidateQueries({ queryKey: ["profile"] }),
			]);
		} finally {
			setRefreshing(false);
		}
	}, [queryClient]);

	const showNoGoalsDueToday = !isLoading && groupedGoals.today.length === 0;

	const handleToggle = async (
		goal: GoalWithParticipant,
		isCompleted: boolean,
	) => {
		if (!userId) return;

		if (
			!isCompleted &&
			goal.attachment_type !== ATTACHMENT_TYPES.NONE &&
			goal.require_attachment
		) {
			setSelectedGoal(goal);
			requestAnimationFrame(() => {
				attachmentSheetRef.current?.present();
			});

			return;
		}

		try {
			await toggleCompletion(goal.id, isCompleted);
		} catch (error) {
			handleError(error, "Failed to update completion");
		}
	};

	return (
		<View className="flex-1">
			<Screen className="bg-surface-bg">
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerClassName="flex-grow px-6 py-4"
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}
				>
					<View className="w-full max-w-4xl self-center flex-col gap-6 pb-32">
						<GreetingHeader
							greeting={getGreeting()}
							dayString={getCurrentDayString()}
							profileName={profileName}
							avatarUrl={avatarUrl}
							inviteCount={inviteCount}
							onAvatarPress={() => navigation.openDrawer()}
						/>

						<TodaySection
							goals={groupedGoals.today}
							userId={userId}
							error={error}
							isLoading={isLoading}
							showNoGoalsDueToday={showNoGoalsDueToday}
							participantAvatars={participantAvatars}
							onToggle={handleToggle}
							onPress={(id) => router.push(`/app/goal/${id}` as Href)}
						/>

						<UpcomingSection
							goals={groupedGoals.upcoming}
							userId={userId}
							participantAvatars={participantAvatars}
							onPress={(id) => router.push(`/app/goal/${id}` as Href)}
						/>
					</View>
				</ScrollView>
			</Screen>

			<FloatingActionButton
				onPress={() => router.push("/app/goal/new" as Href)}
			/>

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
		</View>
	);
}
