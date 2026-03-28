import { Image } from "expo-image";
import { PencilSimple, Plus } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";

type AvatarPickerProps = {
	displayedAvatar: string | null;
	avatarDisplayName: string;
	onPick: () => void;
	onRemove: () => void;
};

export function AvatarPicker({
	displayedAvatar,
	avatarDisplayName,
	onPick,
	onRemove,
}: AvatarPickerProps) {
	return (
		<View className="items-center gap-4">
			<Pressable onPress={onPick} className="relative">
				{displayedAvatar ? (
					<Image
						source={{ uri: displayedAvatar }}
						className="bg-state-muted-bg"
						style={{ width: 128, height: 128, borderRadius: 9999 }}
						contentFit="cover"
					/>
				) : (
					<View className="h-32 w-32 rounded-full bg-state-muted-bg items-center justify-center">
						<Text className="text-text-light font-bold text-4xl">
							{avatarDisplayName[0]?.toUpperCase() ?? "?"}
						</Text>
					</View>
				)}
				<View className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-action-primary items-center justify-center border-4 border-surface-bg">
					{displayedAvatar ? (
						<PencilSimple size={18} color="white" weight="bold" />
					) : (
						<Plus size={20} color="white" weight="bold" />
					)}
				</View>
			</Pressable>

			{displayedAvatar && (
				<Pressable onPress={onRemove}>
					<Text className="text-state-danger font-bold text-base">
						Remove Photo
					</Text>
				</Pressable>
			)}
		</View>
	);
}
