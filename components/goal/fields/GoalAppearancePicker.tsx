import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { Platform, View } from "react-native";
import { ColorPicker } from "@/components/goal/fields/ColorPicker";
import { IconPickerBottomSheet } from "@/components/overlays/IconPickerBottomSheet";
import { GoalIcon } from "@/components/ui/GoalIcon";
import { cn } from "@/utils/cn";

type GoalAppearancePickerProps = {
	selectedIcon: string;
	selectedColor: string;
	onIconChange: (icon: string) => void;
	onColorChange: (color: string) => void;
	stackColorsUnderIcon?: boolean;
};

export function GoalAppearancePicker({
	selectedIcon,
	selectedColor,
	onIconChange,
	onColorChange,
	stackColorsUnderIcon = false,
}: GoalAppearancePickerProps) {
	const iconPickerRef = useRef<BottomSheetModal>(null);
	const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

	const openIconPicker = () => {
		if (Platform.OS === "web") {
			setIsIconPickerOpen(true);
		} else {
			iconPickerRef.current?.present();
		}
	};

	const closeIconPicker = () => {
		setIsIconPickerOpen(false);
	};

	return (
		<>
			<View
				className={cn(
					"w-full",
					stackColorsUnderIcon
						? "items-center gap-4"
						: "flex-row items-center justify-between",
					Platform.OS === "web" && "flex-row items-center justify-between",
				)}
			>
				<GoalIcon
					icon={selectedIcon}
					color={selectedColor}
					size={64}
					variant="dashed"
					onPress={openIconPicker}
					containerClassName="rounded-[32px]"
				/>

				<ColorPicker
					selectedColor={selectedColor}
					onColorChange={onColorChange}
					containerClassName={cn(
						stackColorsUnderIcon ? "" : "ml-4 max-w-[240px] flex-1 justify-end",
						Platform.OS === "web" && "ml-auto flex-none",
					)}
				/>
			</View>

			<IconPickerBottomSheet
				modalRef={iconPickerRef}
				isOpen={isIconPickerOpen}
				onClose={closeIconPicker}
				selectedIcon={selectedIcon}
				selectedColor={selectedColor}
				onSelect={onIconChange}
			/>
		</>
	);
}
