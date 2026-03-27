import { CheckIcon, FireIcon } from "phosphor-react-native";
import {
	cloneElement,
	isValidElement,
	memo,
	type ReactElement,
	type ReactNode,
} from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import AvatarStack from "@/components/ui/AvatarStack";
import PersonalTag from "@/components/ui/PersonalTag";
import type { GoalWithParticipant } from "@/schemas/goal.schema";

function filledIcon(icon: ReactNode, color: string, size = 28): ReactNode {
	if (!isValidElement(icon)) return icon;
	return cloneElement(icon as ReactElement<Record<string, unknown>>, {
		color,
		size,
		weight: "fill",
	});
}

function hexToRgba(hex: string, alpha: number): string {
	const h = hex.replace("#", "");
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

type GoalItemProps = {
	goal: GoalWithParticipant;
	variant?: "today" | "upcoming";
	userId?: string;
	isCompleted?: boolean;
	isPending?: boolean;
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
	isPending = false,
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

	return (
		<Pressable
			onPress={onPress}
			className="w-full flex-col items-start gap-3 overflow-hidden rounded-3xl border border-border bg-surface-fg p-5"
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
						className="h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
						style={{ backgroundColor: iconBg }}
					>
						{filledIcon(icon, color)}
					</View>

					<View className="flex-1 flex-col justify-center gap-1">
						<Text
							className="font-bold text-2xl leading-9 text-text-strong"
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
						disabled={isPending}
						className={`h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] ${
							isCompletedToday
								? "border-action-primary bg-action-primary"
								: "border-border bg-transparent"
						}`}
					>
						{isPending ? (
							<ActivityIndicator size="small" color="#fff" />
						) : (
							isCompletedToday && (
								<CheckIcon size={20} color="white" weight="bold" />
							)
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
						{participantAvatars.map((pa, i) => (
							<View
								key={pa.user_id}
								className="flex-1 self-stretch rounded-full"
								style={{
									backgroundColor:
										i < completedCount
											? "var(--color-action-primary)"
											: "var(--color-border)",
								}}
							/>
						))}
					</View>
				</View>
			)}
		</Pressable>
	);
});
