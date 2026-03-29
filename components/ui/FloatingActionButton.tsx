import { PlusIcon } from "phosphor-react-native";
import { Pressable, View } from "react-native";

type FloatingActionButtonProps = {
	onPress: () => void;
};

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
	return (
		<View
			className="absolute bottom-12 left-0 right-0 z-50 items-center"
			pointerEvents="box-none"
		>
			<View
				className="w-full max-w-4xl px-6 items-end"
				pointerEvents="box-none"
			>
				<Pressable
					onPress={onPress}
					className="h-16 w-16 items-center justify-center rounded-full bg-action-primary shadow-lg"
					style={{ elevation: 10 }}
				>
					<PlusIcon size={32} color="#ffffff" weight="bold" />
				</Pressable>
			</View>
		</View>
	);
}

export default FloatingActionButton;
