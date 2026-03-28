import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import AttachmentBottomSheet, {
	type AttachmentBottomSheetRef,
} from "@/components/AttachmentBottomSheet";
import GreetingHeader from "@/components/GreetingHeader";
import { GoalItem } from "@/components/goal/GoalItem";
import { Screen } from "@/components/layout/Screen";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import { ATTACHMENT_TYPES } from "@/constants/attachmentTypes";
import {
	goalKeys,
	useGoals,
	useInvites,
	useTodaysCompletions,
	useTodaysCompletionsForGoals,
} from "@/hooks/goal/useGoalQueries";
import { useGoalToggle } from "@/hooks/goal/useGoalToggle";
import { useGroupedGoals } from "@/hooks/goal/useGroupedGoals";
import { usePrefetchGoals } from "@/hooks/goal/usePrefetchGoals";
import { useProfile, useProfilesByIds } from "@/hooks/profile/useProfileHooks";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage, showAlert } from "@/utils/error.utils";
import { getIconComponent } from "@/utils/icons";

const getGreeting = () => {
	const h = new Date().getHours();
	if (h < 12) return "Good morning";
	if (h < 18) return "Good afternoon";
	return "Good evening";
};

const getCurrentDayString = () => {
	const _d = new Date();
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const date = new Date();
	return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
};

export default function HomeScreen() {
	const navigation =
		useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
	const { user } = useAuthStore();
	const userId = user?.id;

	const [selectedGoal, setSelectedGoal] = useState<GoalWithParticipant | null>(
		null,
	);
	const attachmentSheetRef = useRef<AttachmentBottomSheetRef>(null);

	const queryClient = useQueryClient();

	useFocusEffect(
		useCallback(() => {
			queryClient.invalidateQueries({ queryKey: ["profile", userId] });
			queryClient.refetchQueries({ queryKey: ["profiles", "byIds"] });
		}, [queryClient, userId]),
	);

	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await Promise.all([
				queryClient.refetchQueries({ queryKey: goalKeys.all }),
				queryClient.refetchQueries({ queryKey: ["profile", userId] }),
				queryClient.refetchQueries({ queryKey: ["profiles", "byIds"] }),
			]);
		} finally {
			setRefreshing(false);
		}
	}, [queryClient, userId]);

	const { data: goals, isLoading: isGoalsLoading, error } = useGoals();
	usePrefetchGoals(goals, userId);

	const { data: todaysCompletions, isLoading: isCompletionsLoading } =
		useTodaysCompletions(userId);

	const { data: profile } = useProfile(userId);
	const { data: invites } = useInvites(userId);
	const inviteCount = invites?.length ?? 0;

	const { toggleCompletion } = useGoalToggle(userId);

	const groupedGoals = useGroupedGoals(goals, userId, todaysCompletions);

	const goalIds = useMemo(() => goals?.map((g) => g.id) || [], [goals]);

	const { data: completionsForGoals } = useTodaysCompletionsForGoals(goalIds);

	const participantIds = useMemo(() => {
		if (!goals) return [];
		const ids = new Set<string>();
		for (const g of goals) {
			for (const p of g.goal_participants) ids.add(p.user_id);
		}
		return Array.from(ids).sort();
	}, [goals]);

	const { data: profiles } = useProfilesByIds(participantIds);

	const profileMap = useMemo(() => {
		const map = new Map<
			string,
			{
				username: string;
				nickname?: string | null;
				avatar_url?: string | null;
			}
		>();
		if (profiles) {
			for (const p of profiles) {
				map.set(p.id, {
					username: p.username,
					nickname: p.nickname,
					avatar_url: p.avatar_url,
				});
			}
		}
		return map;
	}, [profiles]);

	const completionsMap = useMemo(() => {
		const map = new Map<string, Set<string>>();
		if (completionsForGoals) {
			for (const comp of completionsForGoals) {
				if (!map.has(comp.goal_id)) map.set(comp.goal_id, new Set());
				map.get(comp.goal_id)?.add(comp.user_id);
			}
		}
		return map;
	}, [completionsForGoals]);

	const participantAvatars = useMemo(() => {
		if (!goals) return {};
		const result: Record<
			string,
			Array<{
				user_id: string;
				name: string;
				imageUrl?: string;
				completed: boolean;
			}>
		> = {};
		for (const goal of goals) {
			result[goal.id] = goal.goal_participants.map((p) => {
				const pr = profileMap.get(p.user_id);
				const name = pr?.nickname || pr?.username || "?";
				const imageUrl = pr?.avatar_url ?? undefined;
				const completed = completionsMap.get(goal.id)?.has(p.user_id) || false;
				return { user_id: p.user_id, name, imageUrl, completed };
			});
		}
		return result;
	}, [goals, profileMap, completionsMap]);

	const showNoGoalsDueToday =
		!isGoalsLoading && !isCompletionsLoading && groupedGoals.today.length === 0;

	const p = profile as
		| { nickname?: string; username?: string; avatar_url?: string }
		| null
		| undefined;
	const profileName = p?.nickname || p?.username || user?.email || "?";
	const avatarUrl = p?.avatar_url ?? undefined;

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
		<View className="flex-1">
			<Screen className="bg-surface-bg">
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerClassName="flex-grow px-5 py-6"
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}
				>
					<View className="flex-col gap-8 pb-32">
						<GreetingHeader
							greeting={getGreeting()}
							dayString={getCurrentDayString()}
							profileName={profileName}
							avatarUrl={avatarUrl}
							inviteCount={inviteCount}
							onAvatarPress={() => navigation.openDrawer()}
						/>

						<View className="flex-col items-start justify-start gap-4">
							<Text className="font-semibold text-lg leading-7 text-text-strong">
								Today
							</Text>
							<View className="w-full flex-col items-start justify-start gap-3.5">
								{error && (
									<Text className="text-base text-state-danger">
										Failed to load goals
									</Text>
								)}
								{showNoGoalsDueToday ? (
									<Text className="text-base text-text-light">
										No goals due today
									</Text>
								) : (
									groupedGoals.today.map((goal) => {
										const participant = goal.goal_participants?.find(
											(p) => p.user_id === userId,
										);
										return (
											<GoalItem
												key={goal.id}
												goal={goal}
												variant="today"
												userId={userId}
												isCompleted={goal.isCompleted}
												icon={getIconComponent(participant?.icon || "Target")}
												color={participant?.color || "#4f46e5"}
												onToggle={() => handleToggle(goal, goal.isCompleted)}
												onPress={() =>
													router.push(`/app/goal/${goal.id}` as Href)
												}
												participantAvatars={participantAvatars[goal.id] || []}
											/>
										);
									})
								)}
							</View>
						</View>

						{groupedGoals.upcoming.length > 0 && (
							<View className="mt-2 flex-col items-start justify-start gap-4">
								<Text className="font-semibold text-lg leading-7 text-text-strong">
									Upcoming
								</Text>
								<View className="w-full flex-col items-start justify-start gap-3.5">
									{groupedGoals.upcoming.map((goal) => {
										const participant = goal.goal_participants?.find(
											(p) => p.user_id === userId,
										);
										return (
											<GoalItem
												key={goal.id}
												goal={goal}
												variant="upcoming"
												userId={userId}
												subtitle={`in ${goal.daysUntil} ${goal.daysUntil === 1 ? "day" : "days"}`}
												icon={getIconComponent(participant?.icon || "Target")}
												color={participant?.color || "#4f46e5"}
												onPress={() =>
													router.push(`/app/goal/${goal.id}` as Href)
												}
												participantAvatars={participantAvatars[goal.id] || []}
											/>
										);
									})}
								</View>
							</View>
						)}
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
