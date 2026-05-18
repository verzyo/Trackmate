import { useThemeColors } from "@/hooks/common/useThemeColors";
import type { ParticipantMonthlyPoints } from "@/schemas/goal.schema";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    type LayoutChangeEvent,
    Platform,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

interface GoalPointsChartProps {
	data: ParticipantMonthlyPoints[];
	loading?: boolean;
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

const MOBILE_MONTHS = 6;
const WEB_WIDE_MONTHS = 6;
const WEB_MEDIUM_MONTHS = 5;
const WEB_COMPACT_MONTHS = 5;

export function GoalPointsChart({ data, loading }: GoalPointsChartProps) {
	const colors = useThemeColors();
	const [cardWidth, setCardWidth] = useState(0);
	const { width } = useWindowDimensions();
	const containerWidth = cardWidth || width;
	const visibleMonthCount =
		Platform.OS !== "web"
			? MOBILE_MONTHS
			: containerWidth >= 520
				? WEB_WIDE_MONTHS
				: containerWidth >= 420
					? WEB_MEDIUM_MONTHS
					: WEB_COMPACT_MONTHS;

	const { chartData, legend, maxValue } = useMemo(() => {
		if (data.length === 0) return { chartData: [], legend: [], maxValue: 10 };

		const allMonths = Array.from(new Set(data.map((d) => d.month))).sort();
		const months = allMonths.slice(-visibleMonthCount);

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

		const chartLines = Object.values(userGroups).map((user, index) => {
			let cumulative = allMonths
				.filter((month) => !months.includes(month))
				.reduce((sum, month) => sum + (user.pointsByMonth[month] || 0), 0);
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
		const roundedMax = Math.ceil(calculatedMax / 5) * 5;

		return {
			chartData: chartLines,
			legend: legendItems,
			maxValue: roundedMax || 10,
		};
	}, [data, visibleMonthCount]);

	const handleCardLayout = ({ nativeEvent }: LayoutChangeEvent) => {
		const nextWidth = Math.round(nativeEvent.layout.width);
		if (nextWidth > 0 && Math.abs(nextWidth - cardWidth) > 5) {
			setCardWidth(nextWidth);
		}
	};

	if (loading) {
		return (
			<View
				className="w-full rounded-[32px] border border-border bg-surface-fg p-6 gap-4"
				onLayout={handleCardLayout}
			>
				<Text className="text-2xl font-bold text-text-strong">
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

	const cardPadding = Platform.OS === "web" ? 20 : 24;
	const yAxisLabelWidth = 35;
	const isReady = Platform.OS !== "web" || cardWidth > 0;
	const chartWidth = Math.max(
		containerWidth - cardPadding * 2 - yAxisLabelWidth,
		200,
	);
	const pointCount = chartData[0]?.data.length || 0;
	const edgeSpacing = Platform.OS === "web" ? 14 : 10;
	const spacing =
		pointCount > 1
			? Math.max((chartWidth - edgeSpacing * 2) / (pointCount - 1), 40)
			: 0;

	return (
		<View
			className="w-full rounded-[32px] border border-border bg-surface-fg overflow-hidden"
			style={{
				padding: cardPadding,
			}}
			onLayout={handleCardLayout}
		>
			<Text className="text-xl font-bold text-text-strong mb-2">
				Points Progress
			</Text>

			{isReady && (
				<View className="relative">
					<LineChart
						data={chartData[0]?.data || []}
						data2={chartData[1]?.data}
						data3={chartData[2]?.data}
						data4={chartData[3]?.data}
						data5={chartData[4]?.data}
						color={chartData[0]?.color}
						color2={chartData[1]?.color}
						color3={chartData[2]?.color}
						color4={chartData[3]?.color}
						color5={chartData[4]?.color}
						startFillColor={chartData[0]?.fillColor}
						startFillColor2={chartData[1]?.fillColor}
						startFillColor3={chartData[2]?.fillColor}
						startFillColor4={chartData[3]?.fillColor}
						startFillColor5={chartData[4]?.fillColor}
						endFillColor="transparent"
						endFillColor2="transparent"
						endFillColor3="transparent"
						endFillColor4="transparent"
						endFillColor5="transparent"
						startOpacity={0.6}
						startOpacity2={0.6}
						startOpacity3={0.6}
						startOpacity4={0.6}
						startOpacity5={0.6}
						endOpacity={0.0}
						endOpacity2={0.0}
						endOpacity3={0.0}
						endOpacity4={0.0}
						endOpacity5={0.0}
						curved
						isAnimated={Platform.OS !== "web"}
						curveType={1}
						thickness={3}
						thickness2={3}
						thickness3={3}
						thickness4={3}
						thickness5={3}
						hideDataPoints
						disableScroll
						spacing={spacing}
						initialSpacing={edgeSpacing}
						endSpacing={edgeSpacing}
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
						yAxisLabelWidth={yAxisLabelWidth}
						width={chartWidth}
						height={168}
						xAxisLabelsHeight={30}
						xAxisLabelsVerticalShift={10}
						xAxisLabelsAtBottom
						labelsExtraHeight={24}
						xAxisTextNumberOfLines={1}
						animateOnDataChange
						animationDuration={800}
						yAxisLabelPrefix=""
						showVerticalLines={false}
					/>
					<View className="flex-row flex-wrap items-center justify-center gap-2 absolute bottom-0 left-0 right-0">
						{legend.map((item) => (
							<View
								key={item.userId}
								className="flex-row items-center gap-2 rounded-full px-3 py-1.5"
								style={{
									backgroundColor: `${colors.border}30`,
								}}
							>
								<View
									className="h-2.5 w-2.5 rounded-full"
									style={{ backgroundColor: item.color }}
								/>
								<Text className="text-xs font-medium text-text-strong">
									{item.name}
								</Text>
							</View>
						))}
					</View>
				</View>
			)}
		</View>
	);
}

function formatMonthLabel(monthStr: string): string {
	const date = new Date(`${monthStr}-01`);
	return date.toLocaleDateString("en-US", { month: "short" });
}
