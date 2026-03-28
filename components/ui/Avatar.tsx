import { Image } from "expo-image";
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
	const getInitial = () => {
		if (!name) return "?";
		return name.charAt(0).toUpperCase();
	};

	const avatarContent = (
		<View
			className="items-center justify-center overflow-hidden bg-label-bg"
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
			}}
		>
			{typeof imageUrl === "string" && imageUrl.trim() !== "" ? (
				<Image
					source={{ uri: imageUrl }}
					style={{ width: size, height: size }}
					contentFit="cover"
				/>
			) : (
				<Text
					className="font-bold text-label-fg"
					style={{ fontSize: size * 0.38 }}
				>
					{getInitial()}
				</Text>
			)}
		</View>
	);

	if (completed) {
		return (
			<View
				className="border-2 border-surface-fg"
				style={{ borderRadius: (size + 8) / 2 }}
			>
				<View
					className="border-2 border-state-success"
					style={{ borderRadius: (size + 4) / 2 }}
				>
					{avatarContent}
				</View>
			</View>
		);
	}

	return (
		<View
			className="border-2 border-surface-fg"
			style={{ borderRadius: (size + 4) / 2 }}
		>
			{avatarContent}
		</View>
	);
}

export default Avatar;
