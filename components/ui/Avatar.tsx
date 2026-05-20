import { Image } from "expo-image";
import { PencilSimple, Plus } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { cn } from "@/utils/cn";

interface AvatarProps {
	name?: string;
	imageUrl?: string | null;
	completed?: boolean;
	size?: number;
	onPress?: () => void;
	badgeCount?: number;
	showPickerIcon?: boolean;
	pickerIconType?: "plus" | "edit";
	containerClassName?: string;
	borderWidth?: number;
}

export function Avatar({
	name,
	imageUrl,
	completed = false,
	size = 32,
	onPress,
	badgeCount,
	showPickerIcon = false,
	pickerIconType = "edit",
	containerClassName,
	borderWidth = 2,
}: AvatarProps) {
	const colors = useThemeColors();
	const [imageFailed, setImageFailed] = useState(false);

	useEffect(() => {
		setImageFailed(false);
	}, []);

	const normalizedImageUrl =
		typeof imageUrl === "string" ? imageUrl.trim() : "";
	const showImage = normalizedImageUrl.length > 0 && !imageFailed;

	const getInitial = () => {
		if (!name) return "?";
		return name.charAt(0).toUpperCase();
	};

	const content = (
		<View className="relative">
			<View
				className={cn(
					"items-center justify-center overflow-hidden bg-label-bg",
					containerClassName,
				)}
				style={{
					width: size,
					height: size,
					borderRadius: size / 2,
					borderWidth: borderWidth,
					borderColor: colors.surfaceFg,
				}}
			>
				{showImage ? (
					<Image
						source={{ uri: normalizedImageUrl }}
						style={{ width: size, height: size }}
						contentFit="cover"
						onError={() => setImageFailed(true)}
					/>
				) : (
					<Text
						className="font-bold text-label-fg"
						style={{ fontSize: size * 0.38 }}
					>
						{getInitial()}
					</Text>
				)}

				{completed && (
					<View
						pointerEvents="none"
						className="absolute border-2 border-state-success"
						style={{
							top: 0,
							right: 0,
							bottom: 0,
							left: 0,
							borderRadius: size / 2,
						}}
					/>
				)}
			</View>

			{badgeCount !== undefined && badgeCount > 0 && (
				<View
					className="absolute -top-1 -right-1 z-10 h-[22px] min-w-[22px] items-center justify-center rounded-full bg-state-danger px-1 shadow-sm"
					style={{ borderWidth: 3, borderColor: colors.surfaceBg }}
				>
					<Text className="font-bold text-[10px] text-white">{badgeCount}</Text>
				</View>
			)}

			{showPickerIcon && (
				<View
					className="absolute items-center justify-center rounded-full bg-action-primary border-surface-bg"
					style={{
						bottom: -size * 0.05,
						right: -size * 0.05,
						width: size * 0.32,
						height: size * 0.32,
						borderWidth: size * 0.03,
					}}
				>
					{pickerIconType === "edit" ? (
						<PencilSimple size={size * 0.14} color="white" weight="bold" />
					) : (
						<Plus size={size * 0.16} color="white" weight="bold" />
					)}
				</View>
			)}
		</View>
	);

	if (onPress) {
		return <Pressable onPress={onPress}>{content}</Pressable>;
	}

	return content;
}

export default Avatar;
