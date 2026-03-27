import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Button, Text, TextInput } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { supabase } from "@/lib/supabase";
import {
	type RegisterForm,
	RegisterFormSchema,
} from "@/schemas/profile.schema";
import { showAlert } from "@/utils/error.utils";

export default function RegisterScreen() {
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterForm>({
		resolver: zodResolver(RegisterFormSchema),
	});

	const onSubmit = async (data: RegisterForm) => {
		const { error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: { data: { username: data.username, nickname: data.nickname } },
		});
		if (error) {
			showAlert(error.message, "Registration Failed");
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

			<Text>Username*</Text>
			<Controller
				control={control}
				name="username"
				render={({ field: { onChange, value } }) => (
					<TextInput
						value={value}
						onChangeText={onChange}
						autoCapitalize="none"
						placeholder="username"
					/>
				)}
			/>
			{errors.username && (
				<Text className="text-red-500">{errors.username.message}</Text>
			)}

			<Text>Nickname</Text>
			<Controller
				control={control}
				name="nickname"
				render={({ field: { onChange, value } }) => (
					<TextInput
						value={value}
						onChangeText={onChange}
						placeholder="nickname"
					/>
				)}
			/>

			<Button
				title={isSubmitting ? "Registering..." : "Register"}
				onPress={handleSubmit(onSubmit)}
				disabled={isSubmitting}
			/>

			<Text className="text-blue-500" onPress={() => router.replace("/login")}>
				Already have an account? Log in
			</Text>
		</Screen>
	);
}
