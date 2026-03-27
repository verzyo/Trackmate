import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
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
		const [url, setUrl] = useState("");
		const [text, setText] = useState("");
		const [imageUri, setImageUri] = useState<string | null>(null);
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
				setImageUri(result.assets[0].uri);
			}
		};

		const handleSubmit = async () => {
			if (!user) return;
			setIsSubmitting(true);
			try {
				let data: AttachmentData | undefined;
				if (attachmentType === "photo") {
					if (!imageUri && requireAttachment)
						throw new Error("Please select an image");
					if (imageUri) {
						const path = await uploadAttachment(
							user.id,
							imageUri,
							"image/jpeg",
						);
						data = { type: "photo", path };
					}
				} else if (attachmentType === "url") {
					if (!url.trim() && requireAttachment)
						throw new Error("Please enter a URL");
					if (url.trim()) data = { type: "url", url: url.trim() };
				} else if (attachmentType === "text") {
					if (!text.trim() && requireAttachment)
						throw new Error("Please enter text");
					if (text.trim()) data = { type: "text", content: text.trim() };
				}

				await onComplete(data);
				bottomSheetRef.current?.dismiss();

				setUrl("");
				setText("");
				setImageUri(null);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				showAlert(message);
			} finally {
				setIsSubmitting(false);
			}
		};

		const handleDismiss = () => {
			setUrl("");
			setText("");
			setImageUri(null);
		};

		return (
			<BottomSheetModal
				ref={bottomSheetRef}
				snapPoints={["50%"]}
				onDismiss={handleDismiss}
			>
				<BottomSheetView className="p-4">
					<Text className="text-lg font-bold mb-4">Provide Proof</Text>
					{attachmentType === "photo" && (
						<View className="mb-4">
							<Button title="Pick an image" onPress={pickImage} />
							{imageUri && (
								<Text className="mt-2 text-green-600">Image selected</Text>
							)}
						</View>
					)}
					{attachmentType === "url" && (
						<TextInput
							placeholder="https://example.com"
							value={url}
							onChangeText={setUrl}
							className="border border-gray-300 p-2 mb-4 rounded"
						/>
					)}
					{attachmentType === "text" && (
						<TextInput
							placeholder="Write your proof..."
							value={text}
							onChangeText={setText}
							multiline
							numberOfLines={4}
							className="border border-gray-300 p-2 mb-4 rounded"
						/>
					)}
					<View className="flex-row justify-end gap-2 mt-4">
						<Button
							title="Cancel"
							onPress={() => bottomSheetRef.current?.dismiss()}
							disabled={isSubmitting}
						/>
						<Button
							title="Complete"
							onPress={handleSubmit}
							disabled={isSubmitting}
						/>
					</View>
				</BottomSheetView>
			</BottomSheetModal>
		);
	},
);

export default AttachmentBottomSheet;
