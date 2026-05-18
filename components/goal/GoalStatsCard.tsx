import { CheckCircle, Fire, Star, Trophy } from "phosphor-react-native";
import { ActivityIndicator, Text, View } from "react-native";
import { useThemeColors } from "@/hooks/common/useThemeColors";

interface GoalStatsCardProps {
	streak: number | null | undefined;
	points: number | null | undefined;
	rank: number | null | undefined;
	loading?: boolean;
	showRank?: boolean;
}

interface StatItemProps {
	icon: React.ReactNode;
	value: string;
	label: string;
}

function StatItem({ icon, value, label }: StatItemProps) {
	return (
		<View className="flex-1 items-center justify-center rounded-[32px] border border-border bg-surface-fg p-6 gap-1">
			{icon}
			<Text className="text-xl font-bold text-text-strong">
				{value}
			</Text>
			<Text className="text-xs font-semibold tracking-wider text-text-light">
				{label}
			</Text>
		</View>
	);
}

export function GoalStatsCard({
	streak,
	points,
	rank,
	loading = false,
	showRank = true,
}: GoalStatsCardProps) {
	const colors = useThemeColors();

	if (loading) {
		return (
			<View className="w-full flex-row gap-3">
				<View className="flex-1 items-center justify-center rounded-[32px] border border-border bg-surface-fg p-6">
					<ActivityIndicator color={colors.actionPrimary} />
				</View>
				{showRank && (
					<View className="flex-1 items-center justify-center rounded-[32px] border border-border bg-surface-fg p-6">
						<ActivityIndicator color={colors.actionPrimary} />
					</View>
				)}
				<View className="flex-1 items-center justify-center rounded-[32px] border border-border bg-surface-fg p-6">
					<ActivityIndicator color={colors.actionPrimary} />
				</View>
			</View>
		);
	}

	const displayStreak = streak ?? 0;
	const displayPoints = points ?? 0;
	const displayRank = rank ?? 0;

	return (
		<View className="w-full flex-row gap-3">
			<StatItem
				icon={<Fire size={22} color="#f97316" weight="fill" />}
				value={String(displayStreak)}
				label="STREAK"
			/>
			{showRank ? (
				<StatItem
					icon={<Star size={22} color="#4f46e5" weight="fill" />}
					value={String(displayPoints)}
					label="POINTS"
				/>
			) : (
				<StatItem
					icon={<CheckCircle size={22} color="#22c55e" weight="fill" />}
					value={String(displayPoints)}
					label="COMPLETED"
				/>
			)}
			{showRank && (
				<StatItem
					icon={<Trophy size={22} color="#eab308" weight="fill" />}
					value={displayRank > 0 ? `#${displayRank}` : "-"}
					label="RANK"
				/>
			)}
		</View>
	);
}
