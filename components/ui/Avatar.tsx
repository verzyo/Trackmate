import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

interface AvatarProps {
	name?: string;
	imageUrl?: string;
	completed?: boolean;
	size?: number;
}

export function Avatar({
	name,
	imageUrl,
	completed = false,
	size = 32,
}: AvatarProps) {
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

	return (
		<View
			className="items-center justify-center overflow-hidden border-2 border-surface-fg bg-label-bg"
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
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
						top: 2,
						right: 2,
						bottom: 2,
						left: 2,
						borderRadius: Math.max((size - 4) / 2, 0),
					}}
				/>
			)}
		</View>
	);
}

export default Avatar;
