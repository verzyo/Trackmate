import type { Icon } from "phosphor-react-native";
import { CircleIconButton } from "./CircleIconButton";
import { UI_SIZES } from "@/constants/ui";
import { useThemeColors } from "@/hooks/common/useThemeColors";

type ModalButtonProps = {
	onPress: () => void;
	icon: Icon;
	className?: string;
};

export function ModalButton({
	onPress,
	icon: IconComponent,
	className,
}: ModalButtonProps) {
	const colors = useThemeColors();
	return (
		<CircleIconButton onPress={onPress} className={className} hitSlop={8}>
			<IconComponent
				size={UI_SIZES.icon.md}
				color={colors.textStrong}
				weight="bold"
			/>
		</CircleIconButton>
	);
}

export default ModalButton;
