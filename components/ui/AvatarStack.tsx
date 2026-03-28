import { Text, View } from "react-native";
import Avatar from "./Avatar";

interface AvatarData {
	name?: string;
	imageUrl?: string;
	completed?: boolean;
}

interface AvatarStackProps {
	avatars: AvatarData[];
	size?: number;
	overlap?: number;
}

export function AvatarStack({
	avatars,
	size = 32,
	overlap = 6,
}: AvatarStackProps) {
	if (!avatars || avatars.length === 0) return null;

	const sorted = [...avatars].sort((a, b) => {
		if (a.completed && !b.completed) return -1;
		if (!a.completed && b.completed) return 1;
		if (a.imageUrl && !b.imageUrl) return -1;
		if (!a.imageUrl && b.imageUrl) return 1;
		return 0;
	});

	let visible: AvatarData[];
	let overflow: number;
	if (sorted.length <= 4) {
		visible = sorted;
		overflow = 0;
	} else {
		visible = sorted.slice(0, 3);
		overflow = sorted.length - 3;
	}

	const slotSize = size + 4;
	const totalSlots = visible.length + (overflow > 0 ? 1 : 0);
	const totalWidth = slotSize + (totalSlots - 1) * (slotSize - overlap);

	return (
		<View style={{ flexDirection: "row", height: slotSize, width: totalWidth }}>
			{visible.map((avatar, index) => (
				<View
					key={`avatar-${avatar.name ?? index}`}
					style={{
						position: "absolute",
						left: index * (slotSize - overlap),
						zIndex: index,
					}}
				>
					<Avatar
						name={avatar.name}
						imageUrl={avatar.imageUrl}
						completed={avatar.completed}
						size={size}
					/>
				</View>
			))}

			{overflow > 0 && (
				<View
					key="overflow"
					style={{
						position: "absolute",
						left: visible.length * (slotSize - overlap),
						zIndex: visible.length,
					}}
				>
					<View
						className="border-2 border-surface-fg"
						style={{ borderRadius: (size + 4) / 2 }}
					>
						<View
							className="items-center justify-center bg-label-bg"
							style={{
								width: size,
								height: size,
								borderRadius: size / 2,
							}}
						>
							<Text
								className="font-bold text-label-fg"
								style={{ fontSize: size * 0.35 }}
							>
								+{overflow}
							</Text>
						</View>
					</View>
				</View>
			)}
		</View>
	);
}

export default AvatarStack;
