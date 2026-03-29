import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { PencilSimple } from "phosphor-react-native";
import { useRef, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { IconPickerBottomSheet } from "@/components/goal/IconPickerBottomSheet";
import { hexToRgba } from "@/utils/color.utils";
import { DynamicIcon } from "@/utils/icons";

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
				<Pressable
					onPress={openIconPicker}
					className="relative h-32 w-32 items-center justify-center rounded-[32px] border-2 border-dashed"
					style={{
						backgroundColor: hexToRgba(selectedColor, 0.15),
						borderColor: selectedColor,
					}}
				>
					<DynamicIcon
						name={selectedIcon}
						size={64}
						color={selectedColor}
						weight="fill"
					/>
					<View className="absolute -right-1 -bottom-1 h-11 w-11 items-center justify-center rounded-full bg-action-primary border-4 border-surface-bg">
						<PencilSimple size={20} color="white" weight="bold" />
					</View>
				</Pressable>

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
