import { FormField } from "@/components/forms/FormField";
import { AuthScreen } from "@/components/layout/AuthScreen";
import FilledButton from "@/components/ui/FilledButton";
import { supabase } from "@/lib/supabase";
import {
	type RegisterForm,
	RegisterFormSchema,
} from "@/schemas/profile.schema";
import { showAlert } from "@/utils/error.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";

export default function RegisterScreen() {
	const {
		control,
		handleSubmit,
		clearErrors,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<RegisterForm>({
		resolver: zodResolver(RegisterFormSchema),
		defaultValues: {
			email: "",
			username: "",
			nickname: "",
			password: "",
		},
	});

	const onSubmit = async (data: RegisterForm) => {
		clearErrors(["email", "username"]);

		const username = data.username.trim();
		const email = data.email.trim();
		const nicknameInput = data.nickname?.trim() ?? "";
		const nickname = nicknameInput.length > 0 ? nicknameInput : null;

		try {
			const { data: isUsernameAvailable, error: usernameCheckError } =
				await supabase.rpc("is_username_available", { p_username: username });
			if (usernameCheckError) throw usernameCheckError;

			if (!isUsernameAvailable) {
				setError("username", {
					type: "manual",
					message: "Username is already taken",
				});
				return;
			}
		} catch (e) {
			showAlert(
				e instanceof Error ? e.message : "Failed to verify username",
				"Registration Failed",
			);
			return;
		}

		const { data: signUpData, error } = await supabase.auth.signUp({
			email,
			password: data.password,
			options: { data: { username, nickname } },
		});

		if (error) {
			const msg = error.message.toLowerCase();
			if (msg.includes("database error saving new user")) {
				showAlert("Failed to create account");
				return;
			}
			if (msg.includes("user already registered") || msg.includes("already")) {
				setError("email", {
					type: "manual",
					message: "Email is already registered",
				});
				return;
			}

			if (msg.includes("duplicate") || msg.includes("username")) {
				setError("username", {
					type: "manual",
					message: "Username is already taken",
				});
				return;
			}

			showAlert("Failed to create account");
			return;
		}

		if (signUpData.user?.identities?.length === 0) {
			setError("email", {
				type: "manual",
				message: "Email is already registered",
			});
		}
	};

	return (
		<AuthScreen
			title="New to Trackmate?"
			description="Register and start achieving goals with your friends"
			redirectPrompt="Already have an account?"
			redirectAction="Log in"
			onRedirectPress={() => router.push("/login")}
		>
			<FormField
				control={control}
				name="email"
				label="Email Address*"
				placeholder="email@address.com"
				keyboardType="email-address"
				autoCapitalize="none"
				error={errors.email?.message}
			/>

			<FormField
				control={control}
				name="username"
				label="Username*"
				placeholder="username"
				autoCapitalize="none"
				error={errors.username?.message}
			/>

			<FormField
				control={control}
				name="nickname"
				label="Nickname"
				placeholder="nickname"
				error={errors.nickname?.message}
			/>

			<FormField
				control={control}
				name="password"
				label="Password*"
				placeholder="••••••••"
				secureTextEntry
				autoCapitalize="none"
				error={errors.password?.message}
			/>

			<FilledButton
				onPress={handleSubmit(onSubmit)}
				disabled={isSubmitting}
				className="mt-4"
				label={isSubmitting ? "Registering..." : "Register"}
			/>
		</AuthScreen>
	);
}
