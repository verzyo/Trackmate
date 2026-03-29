import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetTextInput,
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
	TextInput,
	View,
} from "react-native";
import { FilledButton } from "@/components/ui/FilledButton";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import type {
	AttachmentData,
	GoalWithParticipant,
} from "@/schemas/goal.schema";
import { uploadAttachment } from "@/services/attachment.service";
import { useAuthStore } from "@/store/auth.store";
import { showAlert } from "@/utils/error.utils";

type Props = {
	goal: GoalWithParticipant;
	onComplete: (attachmentData?: AttachmentData) => Promise<void>;
};

export interface AttachmentBottomSheetRef {
	present: () => void;
	dismiss: () => void;
}

const AttachmentBottomSheet = forwardRef<AttachmentBottomSheetRef, Props>(
	({ goal, onComplete }, ref) => {
		const bottomSheetRef = useRef<BottomSheetModal>(null);
		const { user } = useAuthStore();
		const colors = useThemeColors();
		const showCameraAction = Platform.OS !== "web";
		const [url, setUrl] = useState("");
		const [urlError, setUrlError] = useState<string | null>(null);
		const [text, setText] = useState("");
		const [isSubmitting, setIsSubmitting] = useState(false);

		const attachmentType = goal.attachment_type;
		const requireAttachment = goal.require_attachment;

		useImperativeHandle(ref, () => ({
			present: () => bottomSheetRef.current?.present(),
			dismiss: () => bottomSheetRef.current?.dismiss(),
		}));

		const pickImage = async () => {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				quality: 0.8,
			});
			if (!result.canceled) {
				const uri = result.assets[0].uri;
				await handleImageSelected(uri);
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
				quality: 0.8,
			});
			if (!result.canceled) {
				const uri = result.assets[0].uri;
				await handleImageSelected(uri);
			}
		};
		const handleImageSelected = async (uri: string) => {
			if (!user) return;
			setIsSubmitting(true);
			try {
				const path = await uploadAttachment(user.id, uri, "image/jpeg");
				const data: AttachmentData = { type: "photo", path };
				await onComplete(data);
				bottomSheetRef.current?.dismiss();
				resetState();
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				showAlert(message);
			} finally {
				setIsSubmitting(false);
			}
		};

		const handleUrlChange = (value: string) => {
			setUrl(value);
			setUrlError(null);
		};

		const handleSubmitUrl = async () => {
			if (!url.trim() && requireAttachment) {
				setUrlError("Please enter a URL");
				return;
			}
			if (url.trim()) {
				const urlRegex = /^https?:\/\/.+/;
				if (!urlRegex.test(url.trim())) {
					setUrlError("Provide valid URL");
					return;
				}
			}
			await submitData(
				url.trim() ? { type: "url", url: url.trim() } : undefined,
			);
		};

		const handleSubmitText = async () => {
			if (!text.trim() && requireAttachment) {
				showAlert("Please enter text");
				return;
			}
			await submitData(
				text.trim() ? { type: "text", content: text.trim() } : undefined,
			);
		};

		const submitData = async (data: AttachmentData | undefined) => {
			if (!user) return;
			setIsSubmitting(true);
			try {
				await onComplete(data);
				bottomSheetRef.current?.dismiss();
				resetState();
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				showAlert(message);
			} finally {
				setIsSubmitting(false);
			}
		};

		const resetState = () => {
			setUrl("");
			setUrlError(null);
			setText("");
		};

		const handleDismiss = () => {
			resetState();
		};

		const getTitle = () => {
			switch (attachmentType) {
				case "photo":
					return "Attachment Required";
				case "url":
					return "Attachment Required";
				case "text":
					return "Attachment Required";
				default:
					return "Provide Proof";
			}
		};

		const getSnapPoints = () => {
			switch (attachmentType) {
				case "photo":
					return ["20%"];
				case "url":
					return urlError ? ["27%"] : ["25%"];
				case "text":
					return ["33%"];
				default:
					return ["35%"];
			}
		};

		return (
			<BottomSheetModal
				ref={bottomSheetRef}
				snapPoints={getSnapPoints()}
				enableDynamicSizing={false}
				enablePanDownToClose={true}
				onDismiss={handleDismiss}
				backdropComponent={(props) => (
					<BottomSheetBackdrop
						{...props}
						disappearsOnIndex={-1}
						appearsOnIndex={0}
						opacity={0.5}
						pressBehavior="close"
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
						{/* Header with X button */}
						<View className="flex-row items-center justify-between mb-6">
							<Text
								className="text-xl font-bold"
								style={{ color: colors.textStrong }}
							>
								{getTitle()}
							</Text>
							<Pressable onPress={() => bottomSheetRef.current?.dismiss()}>
								<X size={24} color={colors.textLight} weight="bold" />
							</Pressable>
						</View>

						{isSubmitting && (
							<View className="items-center justify-center py-8">
								<ActivityIndicator color={colors.actionPrimary} size="large" />
								<Text style={{ color: colors.textDefault }} className="mt-4">
									Processing...
								</Text>
							</View>
						)}

						{!isSubmitting && attachmentType === "photo" && (
							<View className="flex-row gap-3 mb-4">
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

						{!isSubmitting && attachmentType === "url" && (
							<View className="gap-4">
								{Platform.OS === "web" ? (
									<TextInput
										placeholder="https://example.com"
										placeholderTextColor={colors.textLight}
										value={url}
										onChangeText={handleUrlChange}
										className="h-14 px-4 rounded-full border"
										style={{
											backgroundColor: colors.surfaceBg,
											borderColor: urlError ? colors.danger : colors.border,
											color: colors.textStrong,
										}}
										autoCapitalize="none"
										autoCorrect={false}
										keyboardType="url"
									/>
								) : (
									<BottomSheetTextInput
										placeholder="https://example.com"
										placeholderTextColor={colors.textLight}
										value={url}
										onChangeText={handleUrlChange}
										className="h-14 px-4 rounded-full border"
										style={{
											backgroundColor: colors.surfaceBg,
											borderColor: urlError ? colors.danger : colors.border,
											color: colors.textStrong,
										}}
										autoCapitalize="none"
										autoCorrect={false}
										keyboardType="url"
									/>
								)}
								{urlError && (
									<Text
										style={{ color: colors.danger }}
										className="text-sm font-medium"
									>
										{urlError}
									</Text>
								)}
								<FilledButton
									label="Submit"
									onPress={handleSubmitUrl}
									disabled={isSubmitting || (!url.trim() && requireAttachment)}
									variant="primary"
								/>
							</View>
						)}

						{!isSubmitting && attachmentType === "text" && (
							<View className="gap-4">
								{Platform.OS === "web" ? (
									<TextInput
										placeholder="Write your proof..."
										placeholderTextColor={colors.textLight}
										value={text}
										onChangeText={setText}
										multiline
										numberOfLines={4}
										className="h-32 px-4 py-3 rounded-3xl border"
										style={{
											backgroundColor: colors.surfaceBg,
											borderColor: colors.border,
											color: colors.textStrong,
											textAlignVertical: "top",
										}}
									/>
								) : (
									<BottomSheetTextInput
										placeholder="Write your proof..."
										placeholderTextColor={colors.textLight}
										value={text}
										onChangeText={setText}
										multiline
										numberOfLines={4}
										className="h-32 px-4 py-3 rounded-3xl border"
										style={{
											backgroundColor: colors.surfaceBg,
											borderColor: colors.border,
											color: colors.textStrong,
											textAlignVertical: "top",
										}}
									/>
								)}
								<FilledButton
									label="Submit"
									onPress={handleSubmitText}
									disabled={isSubmitting || (!text.trim() && requireAttachment)}
									variant="primary"
								/>
							</View>
						)}
					</View>
				</BottomSheetView>
			</BottomSheetModal>
		);
	},
);

export default AttachmentBottomSheet;
