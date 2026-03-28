import { PlusIcon } from "phosphor-react-native";
import { Pressable } from "react-native";

type FloatingActionButtonProps = {
	onPress: () => void;
};

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
	return (
		<Pressable
			onPress={onPress}
			className="absolute right-8 bottom-12 z-50 h-16 w-16 items-center justify-center rounded-full bg-action-primary shadow-lg"
			style={{ elevation: 10 }}
		>
			<PlusIcon size={32} color="#ffffff" weight="bold" />
		</Pressable>
	);
}

export default FloatingActionButton;
