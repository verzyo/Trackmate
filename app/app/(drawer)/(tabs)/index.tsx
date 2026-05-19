import FloatingActionButton from "@/components/home/FloatingActionButton";
import { GoalsSection } from "@/components/home/GoalsSection";
import { Screen } from "@/components/layout/Screen";
import AttachmentBottomSheet, {
	type AttachmentBottomSheetRef,
} from "@/components/overlays/AttachmentBottomSheet";
import { Avatar } from "@/components/ui/Avatar";
import CircleIconButton from "@/components/ui/CircleIconButton";
import { ATTACHMENT_TYPES } from "@/constants/attachmentTypes";
import { UI_SIZES } from "@/constants/ui";
import { useErrorHandler } from "@/hooks/common/useErrorHandler";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { goalKeys } from "@/hooks/goal/useGoalQueries";
import { useGoalToggle } from "@/hooks/goal/useGoalToggle";
import { useHomeData } from "@/hooks/goal/useHomeData";
import { usePrefetchGoalDetails } from "@/hooks/prefetch/usePrefetchGoalDetails";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { getCurrentDayString } from "@/utils/date.utils";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { type Href, router } from "expo-router";
import { ArrowsClockwise } from "phosphor-react-native";
import { useCallback, useRef, useState } from "react";
import { Platform, RefreshControl, Text, View } from "react-native";

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
	const colors = useThemeColors();

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

	usePrefetchGoalDetails(goals, userId);

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
		<Screen
			scrollable
			contentContainerClassName="px-6 py-4"
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
			}
			fixedChildren={
				<>
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
				</>
			}
		>
			<View className="w-full max-w-4xl self-center flex-col gap-6 pb-32">
				<View className="h-16 w-full flex-row items-center justify-between">
					<View className="flex-col items-start justify-center gap-[5px]">
						<Text className="font-bold text-3xl leading-10 tracking-tight text-text-strong">
							{getGreeting()}
						</Text>
						<Text className="font-medium text-lg leading-7 text-text-light">
							{getCurrentDayString()}
						</Text>
					</View>
					<View className="flex-row items-center gap-3">
						{Platform.OS === "web" && (
							<CircleIconButton onPress={handleRefresh} disabled={refreshing}>
								<ArrowsClockwise
									size={UI_SIZES.icon.md}
									color={colors.textStrong}
									weight="bold"
								/>
							</CircleIconButton>
						)}
						<Avatar
							name={profileName}
							imageUrl={avatarUrl}
							badgeCount={inviteCount}
							size={64}
							onPress={() => navigation.openDrawer()}
						/>
					</View>
				</View>

				<GoalsSection
					title="Today"
					goals={groupedGoals.today}
					userId={userId}
					error={error}
					isLoading={isLoading}
					emptyMessage="No goals due today"
					participantAvatars={participantAvatars}
					onToggle={handleToggle}
					onPress={(id: string) => router.push(`/app/goal/${id}` as Href)}
				/>

				<GoalsSection
					title="Upcoming"
					goals={groupedGoals.upcoming}
					userId={userId}
					participantAvatars={participantAvatars}
					onPress={(id: string) => router.push(`/app/goal/${id}` as Href)}
				/>
			</View>
		</Screen>
	);
}
