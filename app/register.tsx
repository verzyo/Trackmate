import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, Button, Platform, Text, TextInput } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { supabase } from "@/lib/supabase";

type RegisterForm = {
	email: string;
	password: string;
	username: string;
	nickname?: string;
};

export default function RegisterScreen() {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<RegisterForm>();

	const onSubmit = async (data: RegisterForm) => {
		const { error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: { data: { username: data.username, nickname: data.nickname } },
		});
		if (error) {
			if (Platform.OS === "web") {
				alert(error.message);
			} else {
				Alert.alert("Registration Failed", error.message);
			}
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
