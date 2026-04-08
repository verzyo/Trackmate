import * as ImagePicker from "expo-image-picker";
import { X } from "phosphor-react-native";
import { forwardRef, useImperativeHandle, useState } from "react";
import {
	ActivityIndicator,
	Modal,
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
		const { user } = useAuthStore();
		const colors = useThemeColors();
		const [isOpen, setIsOpen] = useState(false);
		const [url, setUrl] = useState("");
		const [urlError, setUrlError] = useState<string | null>(null);
		const [text, setText] = useState("");
		const [isSubmitting, setIsSubmitting] = useState(false);

		const attachmentType = goal.attachment_type;
		const requireAttachment = goal.require_attachment;

		const resetState = () => {
			setUrl("");
			setUrlError(null);
			setText("");
		};

		const closeModal = () => {
			setIsOpen(false);
			resetState();
		};

		useImperativeHandle(ref, () => ({
			present: () => setIsOpen(true),
			dismiss: closeModal,
		}));

		const pickImage = async () => {
			try {
				const result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ["images"],
					quality: 0.8,
				});
				if (!result.canceled) {
					const uri = result.assets[0].uri;
					await handleImageSelected(uri);
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				showAlert(message);
			}
		};

		const handleImageSelected = async (uri: string) => {
			if (!user) return;
			setIsSubmitting(true);
			try {
				const path = await uploadAttachment(user.id, uri, "image/jpeg");
				const data: AttachmentData = { type: "photo", path };
				await onComplete(data);
				closeModal();
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

		const submitData = async (data: AttachmentData | undefined) => {
			if (!user) return;
			setIsSubmitting(true);
			try {
				await onComplete(data);
				closeModal();
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				showAlert(message);
			} finally {
				setIsSubmitting(false);
			}
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

		const getTitle = () => {
			switch (attachmentType) {
				case "photo":
				case "url":
				case "text":
					return "Attachment Required";
				default:
					return "Provide Proof";
			}
		};

		return (
			<Modal
				visible={isOpen}
				transparent
				animationType="fade"
				onRequestClose={closeModal}
			>
				<View
					className="flex-1 items-center justify-center"
					style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
				>
					<Pressable className="absolute inset-0" onPress={closeModal} />

					<View
						className="w-full max-w-[480px] max-h-[85vh] rounded-[24px] p-6 overflow-hidden"
						style={{
							backgroundColor: colors.surfaceFg,
							margin: 16,
							zIndex: 1,
						}}
					>
						<View className="mb-6 flex-row items-center justify-between">
							<Text
								className="text-xl font-bold"
								style={{ color: colors.textStrong }}
							>
								{getTitle()}
							</Text>
							<Pressable onPress={closeModal}>
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
							<FilledButton
								label="Pick Image"
								onPress={pickImage}
								disabled={isSubmitting}
								variant="primary"
								className="w-full"
							/>
						)}

						{!isSubmitting && attachmentType === "url" && (
							<View className="gap-4">
								<TextInput
									placeholder="https://example.com"
									placeholderTextColor={colors.textLight}
									value={url}
									onChangeText={handleUrlChange}
									className="h-14 rounded-full border px-4"
									style={{
										backgroundColor: colors.surfaceBg,
										borderColor: urlError ? colors.danger : colors.border,
										color: colors.textStrong,
									}}
									autoCapitalize="none"
									autoCorrect={false}
									keyboardType="url"
								/>
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
								<TextInput
									placeholder="Write your proof..."
									placeholderTextColor={colors.textLight}
									value={text}
									onChangeText={setText}
									multiline
									numberOfLines={4}
									className="h-32 rounded-3xl border px-4 py-3"
									style={{
										backgroundColor: colors.surfaceBg,
										borderColor: colors.border,
										color: colors.textStrong,
										textAlignVertical: "top",
									}}
								/>
								<FilledButton
									label="Submit"
									onPress={handleSubmitText}
									disabled={isSubmitting || (!text.trim() && requireAttachment)}
									variant="primary"
								/>
							</View>
						)}
					</View>
				</View>
			</Modal>
		);
	},
);

export default AttachmentBottomSheet;
