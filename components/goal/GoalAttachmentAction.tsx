import { Pressable, Text } from "react-native";
import { ATTACHMENT_TYPES } from "@/constants/attachmentTypes";
import type { GoalWithParticipant } from "@/schemas/goal.schema";

type GoalAttachmentActionProps = {
	goal: GoalWithParticipant;
	isParticipant: boolean;
	isCompletedToday: boolean;
	hasAttachment: boolean;
	onPress: () => void;
	actionPrimaryColor: string;
};

export function GoalAttachmentAction({
	goal,
	isParticipant,
	isCompletedToday,
	hasAttachment,
	onPress,
	actionPrimaryColor,
}: GoalAttachmentActionProps) {
	if (
		goal.attachment_type === ATTACHMENT_TYPES.NONE ||
		!isParticipant ||
		!isCompletedToday ||
		goal.require_attachment
	) {
		return null;
	}

	return (
		<Pressable onPress={onPress} className="items-center">
			<Text
				className="text-base font-medium"
				style={{ color: actionPrimaryColor }}
			>
				{hasAttachment ? "Update Attachment" : "Add Attachment"}
			</Text>
		</Pressable>
	);
}
