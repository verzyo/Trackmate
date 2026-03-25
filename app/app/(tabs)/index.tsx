import { useQuery } from "@tanstack/react-query";
import { type Href, router } from "expo-router";
import { useMemo } from "react";
import { Button, Pressable, ScrollView, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { fetchGoals, type GoalWithParticipant } from "@/lib/api/goal.api";
import {
	addDaysUTC,
	differenceInDaysUTC,
	getDayOfWeekUTC,
	getTodayUTC,
	isTodayUTC,
} from "@/lib/date.utils";
import { useAuthStore } from "@/lib/store/auth.store";

function getNextDueDate(
	goal: GoalWithParticipant,
	userId: string,
): Date | null {
	const participant = goal.goal_participants.find((p) => p.user_id === userId);
	if (!participant) return null;

	const today = getTodayUTC();

	if (goal.frequency_type === "interval") {
		if (!participant.anchor_date) return null;
		const anchor = new Date(participant.anchor_date);
		const anchorUTC = new Date(
			Date.UTC(
				anchor.getUTCFullYear(),
				anchor.getUTCMonth(),
				anchor.getUTCDate(),
			),
		);
		const diff = differenceInDaysUTC(today, anchorUTC);

		if (diff < 0) return anchorUTC;

		const periods = Math.ceil(diff / goal.frequency_value);
		return addDaysUTC(anchorUTC, periods * goal.frequency_value);
	}

	if (goal.frequency_type === "weekly") {
		if (!participant.weekly_days || participant.weekly_days.length === 0)
			return null;

		const currentTargetDay = getDayOfWeekUTC(today);

		const sortedDays = [...participant.weekly_days].sort((a, b) => a - b);
		const nextDay = sortedDays.find((d) => d >= currentTargetDay);

		if (nextDay !== undefined) {
			return addDaysUTC(today, nextDay - currentTargetDay);
		}

		const firstDayNextWeek = sortedDays[0];
		return addDaysUTC(today, 7 - currentTargetDay + firstDayNextWeek);
	}

	return null;
}

export default function HomeScreen() {
	const { user } = useAuthStore();
	const userId = user?.id;

	const {
		data: goals,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["goals"],
		queryFn: fetchGoals,
	});

	const groupedGoals = useMemo(() => {
		if (!goals || !userId) return { today: [], upcoming: [] };

		const today: (GoalWithParticipant & { nextDueDate: Date })[] = [];
		const upcoming: (GoalWithParticipant & {
			nextDueDate: Date;
			daysUntil: number;
		})[] = [];

		const now = getTodayUTC();

		for (const goal of goals) {
			const nextDate = getNextDueDate(goal, userId);
			if (nextDate) {
				if (isTodayUTC(nextDate)) {
					today.push({ ...goal, nextDueDate: nextDate });
				} else if (nextDate.getTime() > now.getTime()) {
					upcoming.push({
						...goal,
						nextDueDate: nextDate,
						daysUntil: differenceInDaysUTC(nextDate, now),
					});
				}
			}
		}

		upcoming.sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());

		return { today, upcoming };
	}, [goals, userId]);

	return (
		<Screen className="px-6 py-4">
			<ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4 pb-10">
				<Button
					title="NEW GOAL"
					onPress={() => router.push("/app/goal/new" as Href)}
				/>

				{isLoading && <Text>Loading goals...</Text>}
				{error && <Text className="text-red-500">Failed to load goals</Text>}

				{!isLoading && goals?.length === 0 && (
					<Text className="text-neutral-500 mt-10">
						You don't have any goals yet
					</Text>
				)}

				{groupedGoals.today.length > 0 && (
					<View className="w-full items-center gap-2">
						<Text className="text-xl font-bold text-neutral-800">Today</Text>
						{groupedGoals.today.map((goal) => (
							<GoalItem key={goal.id} goal={goal} />
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
		</Screen>
	);
}

function GoalItem({
	goal,
	subtitle,
}: {
	goal: GoalWithParticipant;
	subtitle?: string;
}) {
	return (
		<Pressable
			className="py-3 border-b border-neutral-200 w-full items-center"
			onPress={() => router.push(`/app/goal/${goal.id}` as Href)}
		>
			<Text className="text-lg">{goal.title}</Text>
			{subtitle && <Text className="text-sm text-neutral-500">{subtitle}</Text>}
		</Pressable>
	);
}
