import { Platform, Pressable, View } from "react-native";
import { cn } from "@/utils/cn";

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

type ColorPickerProps = {
	selectedColor: string;
	onColorChange: (color: string) => void;
	containerClassName?: string;
};

export function ColorPicker({
	selectedColor,
	onColorChange,
	containerClassName,
}: ColorPickerProps) {
	return (
		<View
			className={cn(
				"flex-row flex-wrap gap-3",
				Platform.OS === "web"
					? "w-full max-w-[240px] justify-end"
					: "w-[228px] self-center justify-center",
				containerClassName,
			)}
			style={Platform.OS === "web" ? { alignItems: "flex-end" } : undefined}
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
	);
}
