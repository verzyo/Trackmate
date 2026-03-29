import { Plus } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import Avatar from "@/components/ui/Avatar";
import { useThemeColors } from "@/hooks/common/useThemeColors";

interface SuggestedUserAvatarProps {
	userId: string;
	username: string;
	nickname?: string;
	avatarUrl?: string;
	onPress: (userId: string, username: string) => void;
}

export function SuggestedUserAvatar({
	userId,
	username,
	nickname,
	avatarUrl,
	onPress,
}: SuggestedUserAvatarProps) {
	const colors = useThemeColors();
	const displayName = nickname || username;

	return (
		<Pressable
			onPress={() => onPress(userId, username)}
			className="items-center gap-1"
		>
			<View className="relative">
				<Avatar name={displayName} imageUrl={avatarUrl} size={56} />
				<View
					className="absolute -right-1 -bottom-1 h-6 w-6 items-center justify-center rounded-full border-2"
					style={{
						backgroundColor: colors.actionPrimary,
						borderColor: colors.surfaceBg,
					}}
				>
					<Plus size={14} color="white" weight="bold" />
				</View>
			</View>
			<Text
				className="text-xs font-medium text-text-strong text-center max-w-[64px]"
				style={{ color: colors.textStrong }}
				numberOfLines={1}
			>
				{displayName}
			</Text>
		</Pressable>
	);
}
