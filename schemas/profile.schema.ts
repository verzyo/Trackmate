import { z } from "zod";

export const ProfileUpdatesSchema = z.object({
	username: z.string().optional(),
	nickname: z.string().nullable().optional(),
	avatar_url: z.string().nullable().optional(),
});
export type ProfileUpdates = z.infer<typeof ProfileUpdatesSchema>;

export const LoginFormSchema = z.object({
	email: z.string().email("Invalid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;

export const RegisterFormSchema = z.object({
	email: z.email("Invalid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	username: z.string().min(1, "Username is required"),
	nickname: z.string().optional(),
});
export type RegisterForm = z.infer<typeof RegisterFormSchema>;
