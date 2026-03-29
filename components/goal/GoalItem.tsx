import { CheckIcon, FireIcon } from "phosphor-react-native";
import {
	cloneElement,
	isValidElement,
	memo,
	type ReactElement,
	type ReactNode,
	useMemo,
} from "react";
import { Pressable, Text, View } from "react-native";
import AvatarStack from "@/components/ui/AvatarStack";
import PersonalTag from "@/components/ui/PersonalTag";
import type { GoalWithParticipant } from "@/schemas/goal.schema";
import { hexToRgba } from "@/utils/color.utils";

function filledIcon(icon: ReactNode, color: string, size = 28): ReactNode {
	if (!isValidElement(icon)) return icon;
	return cloneElement(icon as ReactElement<Record<string, unknown>>, {
		color,
		size,
		weight: "fill",
	});
}

type GoalItemProps = {
	goal: GoalWithParticipant;
	variant?: "today" | "upcoming";
	userId?: string;
	isCompleted?: boolean;
	streak?: number;
	subtitle?: string;
	onToggle?: () => void;
	onPress?: () => void;
	icon?: ReactNode;
	color?: string;
	participantAvatars?: {
		user_id: string;
		name: string;
		imageUrl?: string;
		completed: boolean;
	}[];
};

export const GoalItem = memo(function GoalItem({
	goal,
	variant = "today",
	userId,
	isCompleted = false,
	streak = 0,
	subtitle,
	onToggle,
	onPress,
	icon,
	color = "#4f46e5",
	participantAvatars = [],
}: GoalItemProps) {
	const isUpcoming = variant === "upcoming";
	const isPersonal = (goal.goal_participants?.length ?? 0) <= 1;
	const isCompletedToday = isCompleted && !isUpcoming;

	const otherAvatars = participantAvatars
		.filter((p) => p.user_id !== userId)
		.map((p) => ({
			name: p.name,
			imageUrl: p.imageUrl,
			completed: p.completed,
		}));

	const completedCount = participantAvatars.filter((p) => p.completed).length;
	const totalCount = participantAvatars.length;

	const iconBg = hexToRgba(color, 0.15);

	const daysUntilDue = subtitle
		? parseInt(subtitle.replace(/\D/g, ""), 10) || undefined
		: undefined;

	const sortedParticipants = useMemo(() => {
		return [...participantAvatars].sort((a, b) => {
			if (a.completed === b.completed) return 0;
			return a.completed ? -1 : 1;
		});
	}, [participantAvatars]);

	return (
		<Pressable
			onPress={onPress}
			className="w-full flex-col items-start gap-4 overflow-hidden rounded-[32px] border border-border bg-surface-fg p-6"
		>
			{isCompletedToday && (
				<View
					className="absolute top-0 right-0 bottom-0 left-0 z-10 bg-state-muted-bg"
					pointerEvents="none"
				/>
			)}

			<View className="flex-row items-center justify-between self-stretch">
				<View className="flex-1 flex-row items-center gap-4 pr-4">
					<View
						className="h-16 w-16 shrink-0 items-center justify-center rounded-3xl"
						style={{ backgroundColor: iconBg }}
					>
						{filledIcon(icon, color)}
					</View>

					<View className="flex-1 flex-col justify-center gap-1">
						<Text
							className={
								goal.title.length > 16
									? "font-bold text-xl leading-8 text-text-strong"
									: "font-bold text-2xl leading-9 text-text-strong"
							}
							numberOfLines={1}
						>
							{goal.title}
						</Text>

						<View className="flex-row flex-wrap items-center gap-2">
							{isPersonal ? (
								<PersonalTag />
							) : (
								<AvatarStack avatars={otherAvatars} size={24} overlap={6} />
							)}
							{streak > 0 && (
								<View className="flex-row items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5">
									<FireIcon size={12} color="#ea580c" weight="fill" />
									<Text className="font-bold text-orange-600 text-xs">
										{streak}
									</Text>
								</View>
							)}
						</View>
					</View>
				</View>

				{isUpcoming ? (
					<View className="shrink-0 items-center justify-center">
						<Text className="font-medium text-base leading-5 text-action-primary">
							{daysUntilDue === 1 ? "in 1 day" : `in ${daysUntilDue} days`}
						</Text>
					</View>
				) : (
					<Pressable
						onPress={onToggle}
						hitSlop={12}
						className={`h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] ${
							isCompletedToday
								? "border-action-primary bg-action-primary"
								: "border-border bg-transparent"
						}`}
					>
						{isCompletedToday && (
							<CheckIcon size={20} color="white" weight="bold" />
						)}
					</Pressable>
				)}
			</View>

			{!isPersonal && !isUpcoming && (
				<View className="mt-1 w-full flex-col items-start justify-start gap-1.5">
					<View className="w-full flex-row items-end justify-start gap-0.5">
						<Text className="font-bold text-2xl text-action-primary">
							{completedCount}
						</Text>
						<Text className="mb-[1px] text-sm text-text-light">
							/{totalCount}
						</Text>
					</View>
					<View className="h-1.5 w-full flex-row items-center gap-1">
						{sortedParticipants.map((pa) => (
							<View
								key={pa.user_id}
								className={`flex-1 self-stretch rounded-full ${pa.completed ? "bg-action-primary" : "bg-border"}`}
							/>
						))}
					</View>
				</View>
			)}
		</Pressable>
	);
});
