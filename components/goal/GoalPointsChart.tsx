import { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Platform,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import type { ParticipantMonthlyPoints } from "@/schemas/goal.schema";

interface GoalPointsChartProps {
	data: ParticipantMonthlyPoints[];
	loading?: boolean;
}

interface ChartItem {
	value: number;
	color?: string;
}

interface PointerItem {
	value: number;
	color?: string;
}

const CHART_STYLES = [
	{ color: "#6366f1", fill: "rgba(99, 102, 241, 0.15)" },
	{ color: "#22c55e", fill: "rgba(34, 197, 94, 0.15)" },
	{ color: "#f97316", fill: "rgba(249, 115, 22, 0.15)" },
	{ color: "#ec4899", fill: "rgba(236, 72, 153, 0.15)" },
	{ color: "#06b6d4", fill: "rgba(6, 182, 212, 0.15)" },
	{ color: "#8b5cf6", fill: "rgba(139, 92, 246, 0.15)" },
	{ color: "#eab308", fill: "rgba(234, 179, 8, 0.15)" },
	{ color: "#ef4444", fill: "rgba(239, 68, 68, 0.15)" },
];

export function GoalPointsChart({ data, loading }: GoalPointsChartProps) {
	const colors = useThemeColors();
	const [focusedIndex, _setFocusedIndex] = useState<number | null>(null);
	const { width } = useWindowDimensions();

	const { chartData, legend, maxValue } = useMemo(() => {
		if (data.length === 0) return { chartData: [], legend: [], maxValue: 10 };

		// Group by month
		const months = Array.from(new Set(data.map((d) => d.month))).sort();

		// Group by user
		const userGroups = data.reduce(
			(acc, item) => {
				if (!acc[item.user_id]) {
					acc[item.user_id] = {
						user_id: item.user_id,
						username: item.username,
						nickname: item.nickname,
						avatar_url: item.avatar_url,
						pointsByMonth: {},
					};
				}
				acc[item.user_id].pointsByMonth[item.month] = item.points;
				return acc;
			},
			{} as Record<
				string,
				{
					user_id: string;
					username: string;
					nickname: string | null;
					avatar_url: string | null;
					pointsByMonth: Record<string, number>;
				}
			>,
		);

		// Build cumulative data for each user
		const chartLines = Object.values(userGroups).map((user, index) => {
			let cumulative = 0;
			const style = CHART_STYLES[index % CHART_STYLES.length];

			const lineData = months.map((month) => {
				cumulative += user.pointsByMonth[month] || 0;
				return {
					value: cumulative,
					label: formatMonthLabel(month),
				};
			});

			return {
				data: lineData,
				color: style.color,
				fillColor: style.fill,
				user,
				index,
			};
		});

		const legendItems = chartLines.map((line) => ({
			name: line.user.nickname || line.user.username,
			color: line.color,
			userId: line.user.user_id,
			index: line.index,
		}));

		const allValues = chartLines.flatMap((line) =>
			line.data.map((d) => d.value),
		);
		const calculatedMax = Math.max(...allValues, 10);
		// Round up to nearest 5 for cleaner axis
		const roundedMax = Math.ceil(calculatedMax / 5) * 5;

		return {
			chartData: chartLines,
			legend: legendItems,
			maxValue: roundedMax || 10,
		};
	}, [data]);

	if (loading) {
		return (
			<View
				className="w-full rounded-[32px] border p-6"
				style={{
					borderColor: colors.border,
					backgroundColor: colors.surfaceFg,
					gap: 16,
				}}
			>
				<Text
					className="text-2xl font-bold"
					style={{ color: colors.textStrong }}
				>
					Points Progress
				</Text>
				<View className="items-center justify-center py-12">
					<ActivityIndicator color={colors.actionPrimary} size="large" />
				</View>
			</View>
		);
	}

	if (data.length === 0 || chartData.length === 0) {
		return null;
	}

	const availableWidth = Math.max(width - 120, 200);
	const chartWidth =
		Platform.OS === "web"
			? Math.min(availableWidth, 480)
			: Math.min(availableWidth, 520);

	return (
		<View
			className="w-full rounded-[32px] border p-6"
			style={{
				borderColor: colors.border,
				backgroundColor: colors.surfaceFg,
				gap: 16,
			}}
		>
			<Text className="text-xl font-bold" style={{ color: colors.textStrong }}>
				Points Progress
			</Text>

			<View className="items-center overflow-hidden">
				<LineChart
					data={chartData[0]?.data || []}
					data2={chartData[1]?.data}
					data3={chartData[2]?.data}
					data4={chartData[3]?.data}
					data5={chartData[4]?.data}
					color1={chartData[0]?.color}
					color2={chartData[1]?.color}
					color3={chartData[2]?.color}
					color4={chartData[3]?.color}
					color5={chartData[4]?.color}
					startFillColor1={chartData[0]?.fillColor}
					startFillColor2={chartData[1]?.fillColor}
					startFillColor3={chartData[2]?.fillColor}
					startFillColor4={chartData[3]?.fillColor}
					startFillColor5={chartData[4]?.fillColor}
					endFillColor1="transparent"
					endFillColor2="transparent"
					endFillColor3="transparent"
					endFillColor4="transparent"
					endFillColor5="transparent"
					startOpacity1={0.6}
					startOpacity2={0.6}
					startOpacity3={0.6}
					startOpacity4={0.6}
					startOpacity5={0.6}
					endOpacity1={0.0}
					endOpacity2={0.0}
					endOpacity3={0.0}
					endOpacity4={0.0}
					endOpacity5={0.0}
					curved
					curveType={1}
					thickness={3}
					focusEnabled
					focusedDataPointColor="white"
					focusedDataPointRadius={6}
					hideDataPoints
					spacing={chartWidth / (chartData[0]?.data.length || 6)}
					backgroundColor={colors.surfaceFg}
					rulesType="solid"
					rulesColor={colors.border}
					xAxisColor={colors.border}
					yAxisColor={colors.border}
					yAxisTextStyle={{
						color: colors.textLight,
						fontSize: 11,
						fontWeight: "500",
					}}
					xAxisLabelTextStyle={{
						color: colors.textLight,
						fontSize: 10,
					}}
					noOfSections={5}
					maxValue={maxValue}
					stepValue={Math.ceil(maxValue / 5)}
					yAxisLabelWidth={35}
					width={chartWidth}
					height={220}
					animateOnDataChange
					animationDuration={800}
					yAxisLabelPrefix=""
					showVerticalLines={false}
					pointerConfig={{
						pointerStripHeight: 220,
						pointerStripColor: colors.border,
						pointerStripWidth: 1,
						pointerColor: colors.actionPrimary,
						radius: 5,
						pointerLabelWidth: 80,
						pointerLabelComponent: (items: PointerItem[]) => (
							<View
								style={{
									backgroundColor: colors.surfaceFg,
									paddingHorizontal: 8,
									paddingVertical: 4,
									borderRadius: 8,
									borderWidth: 1,
									borderColor: colors.border,
								}}
							>
								{items.map((item: ChartItem, idx: number) => (
									<Text
										key={item.color || idx}
										style={{
											color: item.color || colors.textStrong,
											fontSize: 10,
											fontWeight: "600",
										}}
									>
										{item.value} pts
									</Text>
								))}
							</View>
						),
					}}
				/>
			</View>

			<View className="flex-row flex-wrap gap-2">
				{legend.map((item) => (
					<View
						key={item.userId}
						className="flex-row items-center gap-2 rounded-full px-3 py-1.5"
						style={{
							backgroundColor:
								focusedIndex === item.index
									? `${item.color}20`
									: `${colors.border}30`,
						}}
					>
						<View
							className="h-2.5 w-2.5 rounded-full"
							style={{ backgroundColor: item.color }}
						/>
						<Text
							className="text-xs font-medium"
							style={{
								color:
									focusedIndex === item.index ? item.color : colors.textLight,
							}}
						>
							{item.name}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
}

function formatMonthLabel(monthStr: string): string {
	const date = new Date(`${monthStr}-01`);
	return date.toLocaleDateString("en-US", { month: "short" });
}
