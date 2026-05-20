import type { ReactNode, RefObject } from "react";
import type { Control, FieldErrors } from "react-hook-form";
import type { ScrollView } from "react-native";
import { View } from "react-native";
import { InviteManager } from "@/components/forms/InviteManager";
import { ModalScreen } from "@/components/layout/ModalScreen";
import { FormField } from "@/components/ui/FormField";
import type { GoalForm } from "@/schemas/goal.schema";
import { GoalAppearancePicker } from "../goal/fields/GoalAppearancePicker";
import { GoalFieldsSection } from "../goal/fields/GoalFieldsSection";

type GoalFormScreenProps = {
	title: string;
	control: Control<GoalForm>;
	errors: FieldErrors<GoalForm>;
	isOwner: boolean;
	selectedIcon: string;
	selectedColor: string;
	onIconChange: (icon: string) => void;
	onColorChange: (color: string) => void;
	invitees: any[];
	onAddInvite: (username: string) => Promise<void>;
	onRemoveInvite: (userId: string) => void;
	onCancelInvite?: (inviteId: string) => void;
	onKickMember?: (userId: string) => void;
	handleInviteInputFocus: (input: any) => void;
	currentUserId?: string;
	existingParticipants?: string[];
	children?: ReactNode;
	actions?: ReactNode;
	scrollViewRef?: RefObject<ScrollView | null>;
};

export function GoalFormScreen({
	title,
	control,
	errors,
	isOwner,
	selectedIcon,
	selectedColor,
	onIconChange,
	onColorChange,
	invitees,
	onAddInvite,
	onRemoveInvite,
	onCancelInvite,
	onKickMember,
	handleInviteInputFocus,
	currentUserId,
	existingParticipants,
	children,
	actions,
	scrollViewRef,
}: GoalFormScreenProps) {
	return (
		<ModalScreen ref={scrollViewRef as any} title={title}>
			<View className="flex-1 w-full max-w-3xl self-center gap-8 pb-8">
				<View className="gap-8">
					<GoalFieldsSection title="Appearance">
						<GoalAppearancePicker
							selectedIcon={selectedIcon}
							selectedColor={selectedColor}
							onIconChange={onIconChange}
							onColorChange={onColorChange}
							stackColorsUnderIcon={!isOwner}
						/>
					</GoalFieldsSection>

					{isOwner && (
						<GoalFieldsSection title="Basic Info">
							<View className="w-full gap-4">
								<FormField
									control={control}
									name="title"
									label="Title*"
									placeholder="Goal's title"
									error={errors.title?.message}
								/>
								<FormField
									control={control}
									name="description"
									label="Description"
									placeholder="Describe your goal's objective..."
									error={errors.description?.message}
									multiline
									style={{
										height: 100,
										textAlignVertical: "top",
										paddingTop: 16,
									}}
								/>
							</View>
						</GoalFieldsSection>
					)}

					{children}

					{isOwner && (
						<GoalFieldsSection title="Participants">
							<InviteManager
								invitees={invitees}
								onAdd={onAddInvite}
								onRemove={onRemoveInvite}
								onCancelInvite={onCancelInvite}
								onKickMember={onKickMember}
								onInputFocus={handleInviteInputFocus}
								onInputPress={handleInviteInputFocus}
								userId={currentUserId}
								existingParticipants={existingParticipants}
							/>
						</GoalFieldsSection>
					)}
				</View>

				<View className="mt-auto gap-3">{actions}</View>
			</View>
		</ModalScreen>
	);
}
