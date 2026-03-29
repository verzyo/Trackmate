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
	const colors = useThemeColors();

	return (
		<View
			className="flex-1 items-center justify-center rounded-[32px] border p-6"
			style={{
				borderColor: colors.border,
				backgroundColor: colors.surfaceFg,
				gap: 4,
			}}
		>
			{icon}
			<Text className="text-xl font-bold" style={{ color: colors.textStrong }}>
				{value}
			</Text>
			<Text
				className="text-xs font-semibold tracking-wider"
				style={{ color: colors.textLight }}
			>
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
			<View
				className="w-full flex-row gap-3"
				style={{
					borderColor: colors.border,
					backgroundColor: colors.surfaceFg,
				}}
			>
				<View
					className="flex-1 items-center justify-center rounded-[32px] border p-6"
					style={{
						borderColor: colors.border,
						backgroundColor: colors.surfaceFg,
					}}
				>
					<ActivityIndicator color={colors.actionPrimary} />
				</View>
				{showRank && (
					<View
						className="flex-1 items-center justify-center rounded-[32px] border p-6"
						style={{
							borderColor: colors.border,
							backgroundColor: colors.surfaceFg,
						}}
					>
						<ActivityIndicator color={colors.actionPrimary} />
					</View>
				)}
				<View
					className="flex-1 items-center justify-center rounded-[32px] border p-6"
					style={{
						borderColor: colors.border,
						backgroundColor: colors.surfaceFg,
					}}
				>
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
