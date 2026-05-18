import { CaretDown, CaretUp } from "phosphor-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import type { LeaderboardEntry } from "@/schemas/goal.schema";
import { cn } from "@/utils/cn";

interface GoalLeaderboardCardProps {
	leaderboard: LeaderboardEntry[];
	currentUserId: string | undefined;
	loading?: boolean;
}

const RANK_COLORS: Record<
	number,
	{ bg: string; text: string; border: string }
> = {
	1: { bg: "#fef3c7", text: "#d97706", border: "#fbbf24" },
	2: { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" },
	3: { bg: "#fff7ed", text: "#ea580c", border: "#fdba74" },
};

const PREVIEW_COUNT = 5;

function displayName(entry: LeaderboardEntry): string {
	return entry.nickname || entry.username;
}

function RankBadge({ rank }: { rank: number }) {
	const colors = RANK_COLORS[rank];
	if (colors) {
		return (
			<View
				className="h-7 w-7 items-center justify-center rounded-full border"
				style={{
					backgroundColor: colors.bg,
					borderColor: colors.border,
					borderWidth: 1.5,
				}}
			>
				<Text className="text-xs font-extrabold" style={{ color: colors.text }}>
					{rank}
				</Text>
			</View>
		);
	}
	return (
		<View className="h-7 w-7 items-center justify-center rounded-full">
			<Text className="text-xs font-bold text-text-light">
				{rank}
			</Text>
		</View>
	);
}

interface LeaderboardRowProps {
	entry: LeaderboardEntry;
	isCurrentUser: boolean;
}

function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
	const colors = useThemeColors();
	const isDark = colors.surfaceBg === "#0f172a";

	return (
		<View
			className={cn(
				"flex-row items-center gap-3 rounded-[24px] border px-4 py-3",
				isCurrentUser 
					? isDark ? "border-indigo-900 bg-indigo-950/30" : "border-indigo-200 bg-indigo-50"
					: "border-border bg-surface-fg"
			)}
		>
			<RankBadge rank={entry.rank} />
			<Avatar
				name={displayName(entry)}
				imageUrl={entry.avatar_url ?? undefined}
				size={40}
			/>
			<View className="flex-1 flex-col gap-0.5">
				<Text
					className="text-sm font-semibold text-text-strong"
					numberOfLines={1}
				>
					{displayName(entry)}
					{isCurrentUser ? " (you)" : ""}
				</Text>
				<Text className="text-xs text-text-light">
					@{entry.username}
				</Text>
			</View>
			<Text
				className="text-sm font-bold text-action-primary"
			>
				{entry.points} pts
			</Text>
		</View>
	);
}

export function GoalLeaderboardCard({
	leaderboard,
	currentUserId,
	loading = false,
}: GoalLeaderboardCardProps) {
	const [expanded, setExpanded] = useState(false);
	const colors = useThemeColors();

	if (loading) {
		return (
			<View className="w-full rounded-[32px] border border-border bg-surface-fg p-6 gap-4">
				<View className="flex-row items-center justify-between">
					<Text className="text-xl font-bold text-text-strong">
						Leaderboard
					</Text>
				</View>
				<View className="items-center justify-center py-8">
					<ActivityIndicator color={colors.actionPrimary} />
				</View>
			</View>
		);
	}

	if (leaderboard.length === 0) {
		return (
			<View className="w-full rounded-[32px] border border-border bg-surface-fg p-6 gap-4">
				<Text className="text-xl font-bold text-text-strong">
					Leaderboard
				</Text>
				<Text className="text-sm text-text-light">
					No participants yet
				</Text>
			</View>
		);
	}

	const hasMore = leaderboard.length > PREVIEW_COUNT;
	const displayEntries = expanded
		? leaderboard
		: leaderboard.slice(0, PREVIEW_COUNT);

	return (
		<View className="w-full rounded-[32px] border border-border bg-surface-fg p-6 gap-4">
			<Text className="text-xl font-bold text-text-strong">
				Leaderboard
			</Text>

			<View className="gap-2">
				{displayEntries.map((entry, index) => {
					const prevEntry = index > 0 ? displayEntries[index - 1] : null;
					const showSeparator = prevEntry && entry.rank - prevEntry.rank > 1;
					const isMe = entry.user_id === currentUserId;

					return (
						<View key={entry.user_id}>
							{showSeparator && (
								<View className="my-1 items-center">
									<Text className="text-xs text-text-light">
										• • •
									</Text>
								</View>
							)}
							<LeaderboardRow entry={entry} isCurrentUser={isMe} />
						</View>
					);
				})}
			</View>

			{hasMore && (
				<Pressable
					onPress={() => setExpanded(!expanded)}
					className="items-center justify-center py-2"
					hitSlop={8}
				>
					{expanded ? (
						<CaretUp size={20} color={colors.actionPrimary} weight="bold" />
					) : (
						<CaretDown size={20} color={colors.actionPrimary} weight="bold" />
					)}
				</Pressable>
			)}
		</View>
	);
}
