import { cssInterop } from "nativewind";
import { Image } from "expo-image";

cssInterop(Image, { className: "style" });
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Button, Platform, Text, TextInput, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { pickAvatar } from "@/hooks/profile/useAvatar";
import { useProfile } from "@/hooks/profile/useProfile";
import { useUpdateProfile } from "@/hooks/profile/useUpdateProfile";
import { removeAvatar, uploadAvatar } from "@/lib/api/profile.api";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/lib/store/auth.store";
import { supabase } from "@/lib/supabase";

type ProfileForm = {
	username: string;
	nickname?: string;
	email: string;
	password?: string;
};

export default function ProfileScreen() {
	const { user } = useAuthStore();
	const userId = user?.id ?? "";
	const { data: profile, isLoading } = useProfile(userId);

	const { mutateAsync: updateProfile, isPending: isUpdating } =
		useUpdateProfile(userId);

	const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
	const [avatarKey, setAvatarKey] = useState(Date.now());
	const [pendingAvatarMime, setPendingAvatarMime] =
		useState<string>("image/jpeg");
	const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<ProfileForm>({
		defaultValues: {
			username: "",
			nickname: "",
			email: "",
		},
	});

	useEffect(() => {
		if (profile) {
			reset({
				username: profile.username ?? "",
				nickname: profile.nickname ?? "",
				email: user?.email ?? "",
			});
			if (profile.avatar_url) setAvatarKey(Date.now());
		}
	}, [profile, user, reset]);

	const handlePickAvatar = async () => {
		try {
			const asset = await pickAvatar();

			if (asset) {
				setPendingAvatarUri(asset.uri);
				setPendingAvatarMime(asset.mimeType ?? "image/jpeg");
				setRemoveAvatarFlag(false);
			}
		} catch (e: unknown) {
			const message = (e as Error)?.message || "Failed to pick avatar";
			handleAlert(message);
		}
	};

	const handleRemoveAvatar = () => {
		setPendingAvatarUri(null);
		setRemoveAvatarFlag(true);
	};

	const displayedAvatar =
		pendingAvatarUri ??
		(removeAvatarFlag
			? null
			: profile?.avatar_url
				? `${profile.avatar_url}?t=${avatarKey}`
				: null);

	const handleAlert = (message: string) => {
		if (Platform.OS === "web") window.alert(message);
		else Alert.alert(message);
	};

	const onSubmit = async (data: ProfileForm) => {
		try {
			if (pendingAvatarUri) {
				await uploadAvatar(userId, pendingAvatarUri, pendingAvatarMime);
			} else if (removeAvatarFlag) {
				await removeAvatar(userId);
			}

			await updateProfile({
				username: data.username,
				nickname: data.nickname?.trim() ? data.nickname : null,
			});

			if (data.email !== user?.email) {
				const { error } = await supabase.auth.updateUser({ email: data.email });
				if (error) throw error;
			}

			if (data.password) {
				const { error } = await supabase.auth.updateUser({
					password: data.password,
				});
				if (error) throw error;
			}

			setPendingAvatarUri(null);
			setRemoveAvatarFlag(false);

			queryClient.invalidateQueries({ queryKey: ["profile", userId] });
			setAvatarKey(Date.now());

			handleAlert("Profile updated successfully");
		} catch (e: unknown) {
			const message = (e as Error)?.message || "Something went wrong";
			handleAlert(message);

			if (profile) {
				reset({
					username: profile.username ?? "",
					nickname: profile.nickname ?? "",
					email: user?.email ?? "",
				});
			}
			setPendingAvatarUri(null);
			setRemoveAvatarFlag(false);
		}
	};

	if (isLoading) return null;

	return (
		<Screen className="items-center justify-center gap-4 px-6">
			{displayedAvatar ? (
				<Image
					source={{ uri: displayedAvatar }}
					className="h-20 w-20 rounded-full bg-neutral-300"
				/>
			) : (
				<View className="h-20 w-20 rounded-full bg-neutral-300" />
			)}

			<Button title="Change avatar" onPress={handlePickAvatar} />
			{displayedAvatar && (
				<Button title="Remove avatar" onPress={handleRemoveAvatar} />
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

			<Text>New password</Text>
			<Controller
				control={control}
				name="password"
				render={({ field: { onChange, value } }) => (
					<TextInput
						value={value}
						onChangeText={onChange}
						secureTextEntry
						placeholder="leave blank to keep current"
					/>
				)}
			/>

			<Button
				title={isSubmitting || isUpdating ? "Saving..." : "Save"}
				onPress={handleSubmit(onSubmit)}
				disabled={isSubmitting || isUpdating}
			/>

			<Button
				title="Log out"
				onPress={() => supabase.auth.signOut()}
				color="red"
			/>
		</Screen>
	);
}
