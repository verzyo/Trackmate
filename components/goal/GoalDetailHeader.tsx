import CircleIconButton from "@/components/ui/CircleIconButton";
import PageHeader from "@/components/ui/PageHeader";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { hexToRgba } from "@/utils/color.utils";
import { DynamicIcon } from "@/utils/icons";
import { type Href, router } from "expo-router";
import { PencilSimple } from "phosphor-react-native";
import { Text, View } from "react-native";

type GoalDetailHeaderProps = {
	goal: GoalWithParticipant;
	goalId: string;
	isParticipant: boolean;
	isViewingOther?: boolean;
	viewUserName?: string;
	iconName: string;
	iconColor: string;
};

export function GoalDetailHeader({
	goal,
	goalId,
	isParticipant,
	isViewingOther,
	viewUserName,
	iconName,
	iconColor,
}: GoalDetailHeaderProps) {
	const colors = useThemeColors();
	const title =
		isViewingOther && viewUserName
			? `${viewUserName}'s Details`
			: "Goal Details";

	return (
		<View>
			<PageHeader
				title={title}
				rightElement={
					isParticipant && !isViewingOther ? (
						<CircleIconButton
							onPress={() => router.push(`/app/goal/edit/${goalId}` as Href)}
						>
							<PencilSimple size={20} color={colors.textStrong} weight="bold" />
						</CircleIconButton>
					) : undefined
				}
			/>
			<View className="flex-row items-center gap-4">
				<View
					className="h-32 w-32 items-center justify-center rounded-[32px]"
					style={{ backgroundColor: hexToRgba(iconColor, 0.15) }}
				>
					<DynamicIcon
						name={iconName}
						size={64}
						color={iconColor}
						weight="fill"
					/>
				</View>

				<View className="flex-1 gap-1.5">
					<Text
						className={
							goal.title.length > 16
								? "text-2xl font-bold leading-8 text-text-strong"
								: "text-3xl font-bold leading-9 text-text-strong"
						}
					>
						{goal.title}
					</Text>

					{goal.description ? (
						<Text
							className="text-base leading-6 text-text-default"
						>
							{goal.description}
						</Text>
					) : null}
				</View>
			</View>
		</View>
	);
}
