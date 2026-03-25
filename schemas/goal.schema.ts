import { z } from "zod";

export const GoalFormSchema = z.object({
	title: z.string().min(1, "Goal title cannot be empty."),
	description: z.string().optional(),
	interval_days: z.string().min(1, "Required"),
	weekly_days: z.string().min(1, "Required"),
});
export type GoalForm = z.infer<typeof GoalFormSchema>;

export const UpdateGoalMetadataSchema = z.object({
	goal_id: z.string(),
	title: z.string().optional(),
	description: z.string().optional(),
});
export type UpdateGoalMetadataParams = z.infer<typeof UpdateGoalMetadataSchema>;

export const UpdateParticipantSettingsSchema = z.object({
	goal_id: z.string(),
	anchor_date: z.string().nullable().optional(),
	weekly_days: z.array(z.number()).nullable().optional(),
});
export type UpdateParticipantSettingsParams = z.infer<
	typeof UpdateParticipantSettingsSchema
>;

export const CreateGoalBackendSchema = z.object({
	title: z.string().min(1),
	description: z.string().nullable().optional(),
	frequency_type: z.enum(["interval", "weekly"]),
	frequency_value: z.number().int().positive(),
	weekly_days: z.array(z.number()).nullable(),
	anchor_date: z.string().nullable(),
	attachment_type: z.enum(["none", "photo", "url", "text"]),
	require_attachment: z.boolean(),
});
export type CreateGoalParams = z.infer<typeof CreateGoalBackendSchema>;

export const GoalSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	owner_id: z.string(),
	created_at: z.string(),
	frequency_type: z.enum(["interval", "weekly"]),
	frequency_value: z.number().int().positive(),
	attachment_type: z.enum(["none", "photo", "url", "text"]),
	require_attachment: z.boolean(),
});
export type Goal = z.infer<typeof GoalSchema>;

export const GoalParticipantSchema = z.object({
	goal_id: z.string(),
	user_id: z.string(),
	joined_at: z.string(),
	weekly_days: z.array(z.number()).nullable(),
	anchor_date: z.string().nullable(),
});
export type GoalParticipant = z.infer<typeof GoalParticipantSchema>;

export const GoalWithParticipantSchema = GoalSchema.extend({
	goal_participants: z.array(GoalParticipantSchema),
});
export type GoalWithParticipant = z.infer<typeof GoalWithParticipantSchema>;

export const AttachmentDataSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("photo"), path: z.string() }),
	z.object({ type: z.literal("url"), url: z.string().url() }),
	z.object({ type: z.literal("text"), content: z.string() }),
]);
export type AttachmentData = z.infer<typeof AttachmentDataSchema>;

export const GoalInviteWithDetailsSchema = z.object({
	id: z.string(),
	goal_id: z.string(),
	inviter_id: z.string(),
	invitee_id: z.string(),
	created_at: z.string(),
	goal: z.object({
		title: z.string(),
		description: z.string().nullable(),
		frequency_type: z.enum(["interval", "weekly"]),
		frequency_value: z.number().int().positive(),
	}),
	inviter: z.object({
		username: z.string(),
		avatar_url: z.string().nullable(),
	}),
});
export type GoalInviteWithDetails = z.infer<typeof GoalInviteWithDetailsSchema>;
