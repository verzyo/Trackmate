import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { IconPickerBottomSheet } from "@/components/overlays/IconPickerBottomSheet";
import { GoalIcon } from "@/components/ui/GoalIcon";

export const GOAL_APPEARANCE_COLORS = [
	"#ef4444",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#14b8a6",
	"#3b82f6",
	"#ec4899",
	"#8b5cf6",
];

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
				className={
					stackColorsUnderIcon
						? "w-full items-center gap-4"
						: "flex-row items-center justify-between"
				}
			>
				<GoalIcon
					icon={selectedIcon}
					color={selectedColor}
					size={64}
					variant="dashed"
					onPress={openIconPicker}
					containerClassName="rounded-[32px]"
				/>

				<View
					className={
						stackColorsUnderIcon
							? "w-[228px] self-center flex-row flex-wrap justify-center gap-3"
							: "ml-4 max-w-[230px] flex-1 flex-row flex-wrap justify-end gap-3"
					}
				>
					{GOAL_APPEARANCE_COLORS.map((color) => {
						const isSelected = selectedColor === color;
						return (
							<Pressable
								key={color}
								onPress={() => onColorChange(color)}
								className="h-12 w-12 items-center justify-center"
							>
								<View
									className="h-10 w-10 rounded-full"
									style={{ backgroundColor: color }}
								/>
								{isSelected && (
									<View
										className="absolute h-12 w-12 rounded-full border-2"
										style={{ borderColor: color }}
									/>
								)}
							</Pressable>
						);
					})}
				</View>
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
