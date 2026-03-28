import { type Href, router } from "expo-router";
import { PencilSimple } from "phosphor-react-native";
import { Text, View } from "react-native";
import CircleIconButton from "@/components/ui/CircleIconButton";
import PageHeader from "@/components/ui/PageHeader";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { hexToRgba } from "@/utils/color.utils";
import { DynamicIcon } from "@/utils/icons";

type GoalDetailHeaderProps = {
	goal: GoalWithParticipant;
	goalId: string;
	isParticipant: boolean;
	iconName: string;
	iconColor: string;
	textStrongColor: string;
	textDefaultColor: string;
};

export function GoalDetailHeader({
	goal,
	goalId,
	isParticipant,
	iconName,
	iconColor,
	textStrongColor,
	textDefaultColor,
}: GoalDetailHeaderProps) {
	return (
		<>
			<PageHeader
				title="Goal Details"
				rightElement={
					isParticipant ? (
						<CircleIconButton
							onPress={() => router.push(`/app/goal/edit/${goalId}` as Href)}
						>
							<PencilSimple size={20} color={textStrongColor} weight="bold" />
						</CircleIconButton>
					) : undefined
				}
			/>
			<View className="flex-row items-center gap-5">
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

				<View className="flex-1 gap-2">
					<Text
						className="text-4xl font-bold leading-[44px] text-text-strong"
						style={{ color: textStrongColor }}
					>
						{goal.title}
					</Text>

					{goal.description ? (
						<Text
							className="text-lg leading-8 text-text-default"
							style={{ color: textDefaultColor }}
						>
							{goal.description}
						</Text>
					) : null}
				</View>
			</View>
		</>
	);
}
