import * as PhosphorIcons from "phosphor-react-native";
import { MagnifyingGlass, X } from "phosphor-react-native";
import { useMemo, useState } from "react";
import {
	FlatList,
	Modal,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { hexToRgba } from "@/utils/color.utils";
import { DynamicIcon } from "@/utils/icons";

const iconSet = new Set<string>();
const componentRefs = new Set<unknown>();

Object.keys(PhosphorIcons).forEach((key) => {
	if (
		/^[A-Z][a-zA-Z]*$/.test(key) &&
		!key.includes("Context") &&
		!key.includes("Base") &&
		!key.includes("Props") &&
		!key.includes("Weight") &&
		!key.endsWith("Fill") &&
		!key.endsWith("Light") &&
		!key.endsWith("Thin") &&
		!key.endsWith("Bold") &&
		!key.endsWith("Duotone")
	) {
		const comp = (PhosphorIcons as Record<string, unknown>)[key];
		if (comp && typeof comp === "function" && !componentRefs.has(comp)) {
			componentRefs.add(comp);
			iconSet.add(key);
		}
	}
});

const ALL_ICONS = Array.from(iconSet).sort();

type IconPickerBottomSheetProps = {
	isOpen: boolean;
	onClose: () => void;
	selectedIcon: string;
	selectedColor: string;
	onSelect: (icon: string) => void;
};

export function IconPickerBottomSheet({
	isOpen,
	onClose,
	selectedIcon,
	selectedColor,
	onSelect,
}: IconPickerBottomSheetProps) {
	const colors = useThemeColors();
	const [query, setQuery] = useState("");

	const filteredIcons = useMemo(() => {
		const normalized = query.toLowerCase().trim();
		if (!normalized) return ALL_ICONS;
		return ALL_ICONS.filter((icon) => icon.toLowerCase().includes(normalized));
	}, [query]);

	const iconPickerSelectedBackground = hexToRgba(colors.actionPrimary, 0.12);
	const iconPreviewColor = selectedColor || colors.actionPrimary;
	const iconGridColumns = 6;
	const iconGridGap = 10;
	const iconTileSize = 56;
	const iconSize = 24;
	const gridWidth =
		iconGridColumns * iconTileSize + (iconGridColumns - 1) * iconGridGap;

	const handleSelect = (item: string) => {
		onSelect(item);
		onClose();
		setQuery("");
	};

	const renderIconTile = (item: string) => (
		<Pressable
			onPress={() => handleSelect(item)}
			className="items-center justify-center rounded-2xl border"
			style={{
				height: iconTileSize,
				width: iconTileSize,
				backgroundColor:
					selectedIcon === item
						? iconPickerSelectedBackground
						: colors.surfaceBg,
				borderColor:
					selectedIcon === item ? colors.actionPrimary : colors.border,
			}}
		>
			<DynamicIcon
				name={item}
				size={iconSize}
				color={iconPreviewColor}
				weight="fill"
			/>
		</Pressable>
	);

	return (
		<Modal
			visible={isOpen}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View
				className="flex-1 items-center justify-center"
				style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
			>
				<View
					className="w-full max-w-[480px] max-h-[85vh] rounded-[24px] p-5 overflow-hidden"
					style={{
						backgroundColor: colors.surfaceFg,
						margin: 16,
					}}
				>
					<View className="flex-row items-center justify-between mb-6">
						<Text
							className="text-xl font-bold text-text-strong"
							style={{ color: colors.textStrong }}
						>
							Choose an Icon
						</Text>
						<Pressable onPress={onClose}>
							<X size={24} color={colors.textLight} weight="bold" />
						</Pressable>
					</View>

					<View
						className="mb-6 h-14 flex-row items-center rounded-[32px] px-4"
						style={{
							backgroundColor: colors.surfaceBg,
							borderColor: colors.border,
							borderWidth: 1,
						}}
					>
						<MagnifyingGlass size={20} color={colors.textLight} />
						<TextInput
							value={query}
							onChangeText={setQuery}
							placeholder="Search icons..."
							placeholderTextColor={colors.textLight}
							style={{
								flex: 1,
								marginLeft: 12,
								fontSize: 16,
								color: colors.textStrong,
								backgroundColor: "transparent",
							}}
							autoFocus={false}
						/>
					</View>

					<View
						className="self-center"
						style={{ width: gridWidth, height: 360 }}
					>
						<FlatList
							data={filteredIcons}
							keyExtractor={(item: string) => item}
							numColumns={iconGridColumns}
							contentContainerStyle={{ paddingBottom: 12 }}
							columnWrapperStyle={{
								justifyContent: "flex-start",
								columnGap: iconGridGap,
								marginBottom: 8,
							}}
							renderItem={({ item }: { item: string }) => renderIconTile(item)}
							showsVerticalScrollIndicator={true}
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
}
