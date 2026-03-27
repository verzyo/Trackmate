import { Pressable, Text, View } from "react-native";
import Avatar from "@/components/ui/Avatar";

type GreetingHeaderProps = {
	greeting: string;
	dayString: string;
	profileName: string;
	avatarUrl?: string;
	inviteCount: number;
	onAvatarPress?: () => void;
};

export default function GreetingHeader({
	greeting,
	dayString,
	profileName,
	avatarUrl,
	inviteCount,
	onAvatarPress,
}: GreetingHeaderProps) {
	return (
		<View className="h-16 w-full flex-row items-center justify-between">
			<View className="flex-col items-start justify-center gap-[5px]">
				<Text className="font-bold text-3xl leading-10 tracking-tight text-text-strong">
					{greeting}
				</Text>
				<Text className="font-medium text-lg leading-7 text-text">
					{dayString}
				</Text>
			</View>

			<Pressable onPress={onAvatarPress}>
				<View className="relative">
					<Avatar size={64} name={profileName} imageUrl={avatarUrl} />
					{inviteCount > 0 && (
						<View
							className="absolute -top-1 -right-1 z-10 h-[22px] min-w-[22px] items-center justify-center rounded-full bg-state-danger px-1 shadow-sm"
							style={{ borderWidth: 3, borderColor: "var(--color-surface-bg)" }}
						>
							<Text className="font-bold text-[10px] text-white">
								{inviteCount}
							</Text>
						</View>
					)}
				</View>
			</Pressable>
		</View>
	);
}
