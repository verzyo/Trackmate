import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Button, Text, TextInput } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { supabase } from "@/lib/supabase";
import { type LoginForm, LoginFormSchema } from "@/schemas/profile.schema";
import { showAlert } from "@/utils/error.utils";

export default function LoginScreen() {
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginForm>({
		resolver: zodResolver(LoginFormSchema),
	});

	const onSubmit = async (data: LoginForm) => {
		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		});
		if (error) {
			showAlert(error.message, "Login Failed");
		}
	};

	return (
		<Screen className="items-center justify-center gap-4 px-6">
			<Text>Email*</Text>
			<Controller
				control={control}
				name="email"
				render={({ field: { onChange, value } }) => (
					<TextInput
						value={value}
						onChangeText={onChange}
						keyboardType="email-address"
						autoCapitalize="none"
						placeholder="email"
					/>
				)}
			/>
			{errors.email && (
				<Text className="text-red-500">{errors.email.message}</Text>
			)}

			<Text>Password*</Text>
			<Controller
				control={control}
				name="password"
				render={({ field: { onChange, value } }) => (
					<TextInput
						value={value}
						onChangeText={onChange}
						secureTextEntry
						autoCapitalize="none"
						placeholder="password"
					/>
				)}
			/>
			{errors.password && (
				<Text className="text-red-500">{errors.password.message}</Text>
			)}

			<Button
				title={isSubmitting ? "Logging in..." : "Log in"}
				onPress={handleSubmit(onSubmit)}
				disabled={isSubmitting}
			/>

			<Text
				className="text-blue-500"
				onPress={() => router.replace("/register")}
			>
				Don't have an account? Register
			</Text>
		</Screen>
	);
}
