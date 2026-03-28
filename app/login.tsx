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
import { type LoginForm, LoginFormSchema } from "@/schemas/profile.schema";
import { showAlert } from "@/utils/error.utils";

export default function LoginScreen() {
	const insets = useSafeAreaInsets();
	const scrollViewRef = useRef<ScrollView>(null);
	const { keyboardHeight } = useKeyboard();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginForm>({
		resolver: zodResolver(LoginFormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handlePasswordFocus = () => {
		requestAnimationFrame(() => {
			scrollViewRef.current?.scrollToEnd({ animated: true });
		});
	};

	const onSubmit = async (data: LoginForm) => {
		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		});
		if (error) {
			showAlert(error.message);
		}
	};

	return (
		<AuthFormShell
			scrollViewRef={scrollViewRef}
			insetsBottom={insets.bottom}
			keyboardHeight={keyboardHeight}
		>
			<View className="items-center">
				<Text className="text-4xl font-bold tracking-tight text-text-strong">
					Welcome back
				</Text>
				<Text className="text-lg font-medium text-text-light mt-2 text-center">
					Log in to continue your social goal tracking journey
				</Text>
			</View>

			<View className="gap-2">
				<FormField
					control={control}
					name="email"
					label="Email Address"
					placeholder="email@address.com"
					keyboardType="email-address"
					autoCapitalize="none"
					error={errors.email?.message}
				/>

				<FormField
					control={control}
					name="password"
					label="Password"
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
					label={isSubmitting ? "Logging in..." : "Log in"}
				/>
			</View>

			<AuthSwitchPrompt
				promptText="Don't have an account?"
				actionText="Register"
				onPress={() => router.replace("/register")}
			/>
		</AuthFormShell>
	);
}
