import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, Button, Platform, Text, TextInput } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { supabase } from "@/lib/supabase";

type LoginForm = {
	email: string;
	password: string;
};

export default function LoginScreen() {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<LoginForm>();

	const onSubmit = async (data: LoginForm) => {
		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		});
		if (error) {
			if (Platform.OS === "web") {
				alert(error.message);
			} else {
				Alert.alert("Login Failed", error.message);
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
