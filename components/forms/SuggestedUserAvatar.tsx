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
		<View className="items-center gap-1">
			<Avatar
				name={displayName}
				imageUrl={avatarUrl}
				size={56}
				showPickerIcon
				pickerIconType="plus"
				onPress={() => onPress(userId, username)}
			/>
			<Text
				className="text-xs font-medium text-text-strong text-center max-w-[64px]"
				style={{ color: colors.textStrong }}
				numberOfLines={1}
			>
				{displayName}
			</Text>
		</View>
	);
}
