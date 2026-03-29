import { z } from "zod";

export const GoalFormSchema = z
	.object({
		title: z
			.string()
			.min(1, "Goal title cannot be empty")
			.max(32, "Title cannot exceed 32 characters"),
		description: z
			.string()
			.max(128, "Description cannot exceed 128 characters")
			.optional(),
		frequency_type: z.enum(["interval", "weekly"]),
		interval_days: z.string().min(1, "Required"),
		weekly_days: z.array(z.number()),
		attachment_type: z.enum(["none", "photo", "url", "text"]),
		require_attachment: z.boolean(),
		color: z.string().optional(),
		icon: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.frequency_type === "weekly" && data.weekly_days.length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select at least one day of the week",
				path: ["weekly_days"],
			});
		}
	});
export type GoalForm = z.infer<typeof GoalFormSchema>;

export const UpdateGoalMetadataSchema = z.object({
	goal_id: z.string(),
	title: z.string().max(32, "Title cannot exceed 32 characters").optional(),
	description: z
		.string()
		.max(128, "Description cannot exceed 128 characters")
		.optional(),
	frequency_type: z.enum(["interval", "weekly"]).optional(),
	frequency_value: z.number().int().positive().optional(),
	start_date: z.string().nullable().optional(),
	weekly_days: z.array(z.number()).nullable().optional(),
	attachment_type: z.enum(["none", "photo", "url", "text"]).optional(),
	require_attachment: z.boolean().optional(),
});
export type UpdateGoalMetadataParams = z.infer<typeof UpdateGoalMetadataSchema>;

export const CreateGoalBackendSchema = z.object({
	title: z.string().min(1).max(32),
	description: z.string().max(128).nullable().optional(),
	frequency_type: z.enum(["interval", "weekly"]),
	frequency_value: z.number().int().positive(),
	weekly_days: z.array(z.number()).nullable(),
	start_date: z.string().nullable(),
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
	start_date: z.string().nullable(),
	weekly_days: z.array(z.number()).nullable(),
	attachment_type: z.enum(["none", "photo", "url", "text"]),
	require_attachment: z.boolean(),
});
export type Goal = z.infer<typeof GoalSchema>;

export const GoalParticipantSchema = z.object({
	goal_id: z.string(),
	user_id: z.string(),
	joined_at: z.string(),
	icon: z.string().nullable().optional(),
	color: z.string().nullable().optional(),
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

export const createWeeklyDaysSchema = (expectedLength?: number) =>
	z
		.string()
		.transform((val) =>
			val
				.split(",")
				.map((n) => Number(n.trim()))
				.filter((n) => !Number.isNaN(n)),
		)
		.transform((arr) => Array.from(new Set(arr)))
		.refine(
			(arr) => !arr.some((d) => d < 1 || d > 7),
			"Weekly days must be between 1 and 7",
		)
		.refine((arr) => arr.length > 0, "Please specify at least one day")
		.refine((arr) => (expectedLength ? arr.length === expectedLength : true), {
			message: `Please select exactly ${expectedLength} days`,
		});

export const LeaderboardEntrySchema = z.object({
	user_id: z.string(),
	username: z.string(),
	nickname: z.string().nullable(),
	avatar_url: z.string().nullable(),
	points: z.number(),
	streak: z.number(),
	rank: z.number(),
});
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

export const ParticipantMonthlyPointsSchema = z.object({
	user_id: z.string(),
	username: z.string(),
	nickname: z.string().nullable(),
	avatar_url: z.string().nullable(),
	month: z.string(),
	points: z.number(),
});
export type ParticipantMonthlyPoints = z.infer<
	typeof ParticipantMonthlyPointsSchema
>;

// Recent attachments from goal completions
export const AttachmentItemSchema = z.object({
	id: z.string(),
	goal_id: z.string(),
	user_id: z.string(),
	completed_at: z.string(),
	attachment_data: AttachmentDataSchema.nullable(),
	username: z.string(),
	nickname: z.string().nullable(),
	avatar_url: z.string().nullable(),
});
export type AttachmentItem = z.infer<typeof AttachmentItemSchema>;
