import { z } from "zod";

export const ProfileUpdatesSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(15, "Username cannot exceed 15 characters")
		.regex(/^[a-zA-Z]/, "Username must start with a letter")
		.regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed")
		.regex(/^(?!.*__)/, "Cannot contain consecutive underscores")
		.regex(/[^_]$/, "Cannot end with an underscore")
		.optional(),
	nickname: z
		.string()
		.max(30, "Nickname cannot exceed 30 characters")
		.nullable()
		.optional(),
	avatar_url: z.string().nullable().optional(),
});
export type ProfileUpdates = z.infer<typeof ProfileUpdatesSchema>;

export const ProfileSchema = z.object({
	id: z.string(),
	username: z.string(),
	nickname: z.string().nullable(),
	avatar_url: z.string().nullable(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const PublicProfileSchema = z.object({
	id: z.string(),
	username: z.string(),
	nickname: z.string().nullable(),
	avatar_url: z.string().nullable(),
});
export type PublicProfile = z.infer<typeof PublicProfileSchema>;

export const LoginFormSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Enter a valid email address"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters"),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;

export const RegisterFormSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Enter a valid email address"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters"),
	username: z
		.string()
		.min(1, "Username is required")
		.min(3, "Username must be at least 3 characters")
		.max(15, "Username cannot exceed 15 characters")
		.regex(/^[a-zA-Z]/, "Username must start with a letter")
		.regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed")
		.regex(/^(?!.*__)/, "Cannot contain consecutive underscores")
		.regex(/[^_]$/, "Cannot end with an underscore"),
	nickname: z
		.string()
		.max(30, "Nickname cannot exceed 30 characters")
		.optional(),
});
export type RegisterForm = z.infer<typeof RegisterFormSchema>;

export const ProfileSettingsFormSchema = z.object({
	username: z
		.string()
		.trim()
		.min(1, "Username is required")
		.min(3, "Username must be at least 3 characters")
		.max(15, "Username cannot exceed 15 characters")
		.regex(/^[a-zA-Z]/, "Username must start with a letter")
		.regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed")
		.regex(/^(?!.*__)/, "Cannot contain consecutive underscores")
		.regex(/[^_]$/, "Cannot end with an underscore"),
	nickname: z
		.string()
		.trim()
		.max(30, "Nickname cannot exceed 30 characters")
		.optional(),
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Enter a valid email address"),
	password: z
		.union([
			z.literal(""),
			z
				.string()
				.min(6, "Password must be at least 6 characters")
				.max(72, "Password cannot exceed 72 characters"),
		])
		.optional(),
});
export type ProfileSettingsForm = z.infer<typeof ProfileSettingsFormSchema>;
