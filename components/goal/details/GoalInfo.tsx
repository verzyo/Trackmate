import { Text, View } from "react-native";
import { GoalIcon } from "@/components/ui/GoalIcon";
import { cn } from "@/utils/cn";

type GoalInfoProps = {
	title: string;
	description?: string | null;
	iconName: string;
	iconColor: string;
	className?: string;
};

export function GoalInfo({
	title,
	description,
	iconName,
	iconColor,
	className,
}: GoalInfoProps) {
	return (
		<View className={cn("flex-row items-center gap-4", className)}>
			<GoalIcon
				icon={iconName}
				color={iconColor}
				size={64}
				containerClassName="rounded-[32px]"
			/>

			<View className="flex-1 gap-1.5">
				<Text
					className={cn(
						"font-bold text-text-strong",
						title.length > 16 ? "text-2xl leading-8" : "text-3xl leading-9",
					)}
				>
					{title}
				</Text>

				{description ? (
					<Text className="text-base leading-6 text-text">{description}</Text>
				) : null}
			</View>
		</View>
	);
}
