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

export const LoginFormSchema = z.object({
	email: z.string().email("Invalid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;

export const RegisterFormSchema = z.object({
	email: z.string().email("Invalid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	username: z
		.string()
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
