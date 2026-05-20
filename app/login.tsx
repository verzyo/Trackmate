import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { AuthScreen } from "@/components/layout/AuthScreen";
import FilledButton from "@/components/ui/FilledButton";
import { FormField } from "@/components/ui/FormField";
import { supabase } from "@/lib/supabase";
import { type LoginForm, LoginFormSchema } from "@/schemas/profile.schema";
import { showAlert } from "@/utils/toast.utils";

export default function LoginScreen() {
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
		<AuthScreen
			title="Welcome back"
			description="Log in to continue your social goal tracking journey"
			redirectPrompt="Don't have an account?"
			redirectAction="Register"
			onRedirectPress={() => router.push("/register")}
		>
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
			/>

			<FilledButton
				onPress={handleSubmit(onSubmit)}
				disabled={isSubmitting}
				className="mt-4"
				label={isSubmitting ? "Logging in..." : "Log in"}
			/>
		</AuthScreen>
	);
}
