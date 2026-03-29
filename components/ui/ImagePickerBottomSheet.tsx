import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { X } from "phosphor-react-native";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
	ActivityIndicator,
	Platform,
	Pressable,
	Text,
	View,
} from "react-native";
import { FilledButton } from "@/components/ui/FilledButton";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { showAlert } from "@/utils/error.utils";

type ImagePickerMode = "photo" | "avatar";

type Props = {
	title: string;
	mode?: ImagePickerMode;
	onImageSelected: (uri: string, mimeType: string) => void;
	enablePanDownToClose?: boolean;
};

export interface ImagePickerBottomSheetRef {
	present: () => void;
	dismiss: () => void;
}

const ImagePickerBottomSheet = forwardRef<ImagePickerBottomSheetRef, Props>(
	(
		{ title, mode = "photo", onImageSelected, enablePanDownToClose = true },
		ref,
	) => {
		const bottomSheetRef = useRef<BottomSheetModal>(null);
		const colors = useThemeColors();
		const [isSubmitting, setIsSubmitting] = useState(false);
		const showCameraAction = Platform.OS !== "web";

		useImperativeHandle(ref, () => ({
			present: () => bottomSheetRef.current?.present(),
			dismiss: () => bottomSheetRef.current?.dismiss(),
		}));

		const pickImage = async () => {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsEditing: mode === "avatar",
				aspect: mode === "avatar" ? [1, 1] : undefined,
				quality: 0.8,
			});
			if (!result.canceled) {
				const asset = result.assets[0];
				handleImageSelected(asset.uri, asset.mimeType ?? "image/jpeg");
			}
		};

		const takePhoto = async () => {
			const { status } = await ImagePicker.requestCameraPermissionsAsync();
			if (status !== "granted") {
				showAlert("Camera permission is required to take photos");
				return;
			}

			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ["images"],
				allowsEditing: mode === "avatar",
				aspect: mode === "avatar" ? [1, 1] : undefined,
				quality: 0.8,
			});
			if (!result.canceled) {
				const asset = result.assets[0];
				handleImageSelected(asset.uri, asset.mimeType ?? "image/jpeg");
			}
		};

		const handleImageSelected = async (uri: string, mimeType: string) => {
			setIsSubmitting(true);
			try {
				await onImageSelected(uri, mimeType);
				bottomSheetRef.current?.dismiss();
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				showAlert(message);
			} finally {
				setIsSubmitting(false);
			}
		};

		return (
			<BottomSheetModal
				ref={bottomSheetRef}
				snapPoints={["20%"]}
				enableDynamicSizing={false}
				enablePanDownToClose={enablePanDownToClose}
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
				<BottomSheetView>
					<View className="p-6">
						<View className="mb-6 flex-row items-center justify-between">
							<Text
								className="text-xl font-bold"
								style={{ color: colors.textStrong }}
							>
								{title}
							</Text>
							<Pressable onPress={() => bottomSheetRef.current?.dismiss()}>
								<X size={24} color={colors.textLight} weight="bold" />
							</Pressable>
						</View>

						{isSubmitting ? (
							<View className="items-center justify-center py-4">
								<ActivityIndicator color={colors.actionPrimary} size="large" />
								<Text className="mt-4" style={{ color: colors.textDefault }}>
									Processing...
								</Text>
							</View>
						) : (
							<View className="flex-row gap-3">
								<FilledButton
									label="Pick Image"
									onPress={pickImage}
									disabled={isSubmitting}
									variant="primary"
									className={showCameraAction ? "flex-1" : "w-full"}
								/>
								{showCameraAction && (
									<FilledButton
										label="Take Photo"
										onPress={takePhoto}
										disabled={isSubmitting}
										variant="primary"
										className="flex-1"
									/>
								)}
							</View>
						)}
					</View>
				</BottomSheetView>
			</BottomSheetModal>
		);
	},
);

export default ImagePickerBottomSheet;
