import {
	BottomSheetBackdrop,
	BottomSheetFlatList,
	BottomSheetModal,
	BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import * as PhosphorIcons from "phosphor-react-native";
import { MagnifyingGlass, X } from "phosphor-react-native";
import { type RefObject, useMemo, useState } from "react";
import {
	FlatList,
	Platform,
	Pressable,
	Text,
	TextInput,
	useWindowDimensions,
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
	modalRef: RefObject<BottomSheetModal | null>;
	selectedIcon: string;
	selectedColor: string;
	onSelect: (icon: string) => void;
};

export function IconPickerBottomSheet({
	modalRef,
	selectedIcon,
	selectedColor,
	onSelect,
}: IconPickerBottomSheetProps) {
	const colors = useThemeColors();
	const { width } = useWindowDimensions();
	const [query, setQuery] = useState("");

	const filteredIcons = useMemo(() => {
		const normalized = query.toLowerCase().trim();
		if (!normalized) return ALL_ICONS;
		return ALL_ICONS.filter((icon) => icon.toLowerCase().includes(normalized));
	}, [query]);

	const iconPickerSelectedBackground = hexToRgba(colors.actionPrimary, 0.12);
	const iconPreviewColor = selectedColor || colors.actionPrimary;
	const iconGridColumns = Platform.OS === "web" ? 5 : 4;
	const iconGridGap = 8;
	const iconGridHorizontalPadding = 48;
	const iconTileSize = Math.max(
		52,
		Math.floor(
			(width -
				iconGridHorizontalPadding -
				iconGridGap * (iconGridColumns - 1)) /
				iconGridColumns,
		),
	);
	const iconSize = Math.max(22, Math.floor(iconTileSize * 0.42));

	const renderIconTile = (item: string) => (
		<Pressable
			onPress={() => {
				onSelect(item);
				modalRef.current?.dismiss();
			}}
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
		<BottomSheetModal
			ref={modalRef}
			snapPoints={["75%"]}
			enableDynamicSizing={false}
			onDismiss={() => setQuery("")}
			backdropComponent={(props) => (
				<BottomSheetBackdrop
					{...props}
					disappearsOnIndex={-1}
					appearsOnIndex={0}
					opacity={0.5}
				/>
			)}
			backgroundStyle={{
				backgroundColor: colors.surfaceFg,
				borderRadius: 32,
			}}
			handleIndicatorStyle={{ backgroundColor: colors.border }}
		>
			<View className="flex-1 p-6">
				<View className="flex-row items-center justify-between mb-6">
					<Text
						className="text-xl font-bold text-text-strong"
						style={{ color: colors.textStrong }}
					>
						Choose an Icon
					</Text>
					<Pressable onPress={() => modalRef.current?.dismiss()}>
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
					{Platform.OS === "web" ? (
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
						/>
					) : (
						<BottomSheetTextInput
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
						/>
					)}
				</View>

				{Platform.OS === "web" ? (
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
					/>
				) : (
					<BottomSheetFlatList
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
					/>
				)}
			</View>
		</BottomSheetModal>
	);
}
