import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { type ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthFormShell from "@/components/auth/AuthFormShell";
import AuthSwitchPrompt from "@/components/auth/AuthSwitchPrompt";
import { FormField } from "@/components/forms/FormField";
import FilledButton from "@/components/ui/FilledButton";
import { useKeyboard } from "@/hooks/common/useKeyboard";
import { supabase } from "@/lib/supabase";
import {
	type RegisterForm,
	RegisterFormSchema,
} from "@/schemas/profile.schema";
import { showAlert } from "@/utils/error.utils";

export default function RegisterScreen() {
	const insets = useSafeAreaInsets();
	const scrollViewRef = useRef<ScrollView>(null);
	const { keyboardHeight } = useKeyboard();

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

	const handlePasswordFocus = () => {
		requestAnimationFrame(() => {
			scrollViewRef.current?.scrollToEnd({ animated: true });
		});
	};

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

			if (isUsernameAvailable === false) {
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
		<AuthFormShell
			scrollViewRef={scrollViewRef}
			insetsBottom={insets.bottom}
			keyboardHeight={keyboardHeight}
			contentClassName="gap-8"
		>
			<View className="items-center">
				<Text className="text-4xl font-bold tracking-tight text-text-strong">
					New to Trackmate?
				</Text>
				<Text className="text-lg font-medium text-text-light mt-2 text-center">
					Register and start achieving goals with your friends
				</Text>
			</View>

			<View className="gap-2">
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
					onFocus={handlePasswordFocus}
				/>

				<FilledButton
					onPress={handleSubmit(onSubmit)}
					disabled={isSubmitting}
					className="mt-4"
					label={isSubmitting ? "Creating Account..." : "Register"}
				/>
			</View>

			<AuthSwitchPrompt
				promptText="Already have an account?"
				actionText="Log in"
				onPress={() => router.replace("/login")}
			/>
		</AuthFormShell>
	);
}
