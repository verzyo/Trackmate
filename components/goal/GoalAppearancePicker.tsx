import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { PencilSimple } from "phosphor-react-native";
import { useRef } from "react";
import { Pressable, View } from "react-native";
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
};

export function GoalAppearancePicker({
	selectedIcon,
	selectedColor,
	onIconChange,
	onColorChange,
}: GoalAppearancePickerProps) {
	const iconPickerRef = useRef<BottomSheetModal>(null);

	return (
		<>
			<View className="flex-row items-center justify-between">
				<Pressable
					onPress={() => iconPickerRef.current?.present()}
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

				<View className="flex-1 ml-4 flex-row flex-wrap justify-end gap-3 max-w-[230px]">
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
				selectedIcon={selectedIcon}
				selectedColor={selectedColor}
				onSelect={onIconChange}
			/>
		</>
	);
}
