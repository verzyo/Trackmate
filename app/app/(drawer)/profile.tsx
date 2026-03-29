import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FormField } from "@/components/forms/FormField";
import { Screen } from "@/components/layout/Screen";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import FilledButton from "@/components/ui/FilledButton";
import ImagePickerBottomSheet, {
	type ImagePickerBottomSheetRef,
} from "@/components/ui/ImagePickerBottomSheet";
import MutedBorderButton from "@/components/ui/MutedBorderButton";
import PageHeader from "@/components/ui/PageHeader";
import { useErrorHandler } from "@/hooks/common/useErrorHandler";
import {
	useDeleteMyAccount,
	useProfile,
	useUpdateProfile,
} from "@/hooks/profile/useProfileHooks";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import {
	type ProfileSettingsForm,
	ProfileSettingsFormSchema,
} from "@/schemas/profile.schema";
import { removeAvatar, uploadAvatar } from "@/services/profile.service";
import { useAuthStore } from "@/store/auth.store";

export default function ProfileScreen() {
	const insets = useSafeAreaInsets();
	const { user } = useAuthStore();
	const userId = user?.id ?? "";
	const { data: profile, isLoading } = useProfile(userId);

	const { mutateAsync: updateProfile, isPending: isUpdating } =
		useUpdateProfile(userId);
	const { mutateAsync: deleteMyAccount, isPending: isDeletingAccount } =
		useDeleteMyAccount();
	const { handleError, showSuccess } = useErrorHandler();

	const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
	const [pendingAvatarMime, setPendingAvatarMime] =
		useState<string>("image/jpeg");
	const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const imagePickerRef = useRef<ImagePickerBottomSheetRef>(null);

	const {
		control,
		handleSubmit,
		clearErrors,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ProfileSettingsForm>({
		resolver: zodResolver(ProfileSettingsFormSchema),
		defaultValues: {
			username: "",
			nickname: "",
			email: "",
			password: "",
		},
	});

	useEffect(() => {
		if (profile) {
			reset({
				username: profile.username ?? "",
				nickname: profile.nickname ?? "",
				email: user?.email ?? "",
			});
		}
	}, [profile, user, reset]);

	const handlePickAvatar = async () => {
		if (Platform.OS === "web") {
			// On web, immediately open image picker
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});
			if (!result.canceled) {
				const asset = result.assets[0];
				handleImageSelected(asset.uri, asset.mimeType ?? "image/jpeg");
			}
		} else {
			imagePickerRef.current?.present();
		}
	};

	const handleRemoveAvatar = () => {
		setPendingAvatarUri(null);
		setRemoveAvatarFlag(true);
	};

	const handleImageSelected = (uri: string, mimeType: string) => {
		setPendingAvatarUri(uri);
		setPendingAvatarMime(mimeType);
		setRemoveAvatarFlag(false);
	};

	const displayedAvatar =
		pendingAvatarUri ??
		(removeAvatarFlag ? null : (profile?.avatar_url ?? null));
	const avatarDisplayName = profile?.nickname || profile?.username || "?";

	const onSubmit = async (data: ProfileSettingsForm) => {
		try {
			const normalizedUsername = data.username.trim();
			const currentUsername = (profile?.username ?? "").trim();

			if (
				normalizedUsername.toLowerCase() !== currentUsername.toLowerCase() &&
				normalizedUsername.length > 0
			) {
				const { data: isUsernameAvailable, error: usernameCheckError } =
					await supabase.rpc("is_username_available", {
						p_username: normalizedUsername,
					});
				if (usernameCheckError) throw usernameCheckError;
				if (isUsernameAvailable === false) {
					setError("username", {
						type: "manual",
						message: "Username is already taken",
					});
					return;
				}
			}
			clearErrors("username");

			if (removeAvatarFlag && profile?.avatar_url) {
				await removeAvatar(userId);
			}

			if (pendingAvatarUri) {
				await uploadAvatar(userId, pendingAvatarUri, pendingAvatarMime);
			}

			await updateProfile({
				username: normalizedUsername,
				nickname: data.nickname?.trim() || null,
			});

			if (data.email !== user?.email) {
				const { error: emailError } = await supabase.auth.updateUser({
					email: data.email,
				});
				if (emailError) throw emailError;
				showSuccess(
					"Profile updated. Please check your email to confirm the change.",
					"Profile Update",
				);
			} else {
				showSuccess("Profile updated successfully!", "Profile Update");
			}

			if (data.password) {
				const { error: passwordError } = await supabase.auth.updateUser({
					password: data.password,
				});
				if (passwordError) throw passwordError;
			}

			setPendingAvatarUri(null);
			setRemoveAvatarFlag(false);
			queryClient.invalidateQueries({ queryKey: ["profile", userId] });
			queryClient.invalidateQueries({ queryKey: ["profiles", "byIds"] });
		} catch (error) {
			handleError(error, "Failed to update profile", "Profile Update");
		}
	};

	const handleDeleteAccount = () => {
		const executeDeleteAccount = async () => {
			try {
				await deleteMyAccount();
				const { error: signOutError } = await supabase.auth.signOut();
				if (signOutError) {
					console.warn(
						"Delete account succeeded but sign out failed",
						signOutError,
					);
				}
			} catch (error) {
				console.error("Failed to delete account", error);
				handleError(error, "Failed to delete account", "Profile Update");
			}
		};

		if (Platform.OS === "web") {
			const shouldDelete = globalThis.confirm(
				"This will permanently delete your account and cannot be undone.",
			);
			if (!shouldDelete) return;
			void executeDeleteAccount();
			return;
		}

		Alert.alert(
			"Delete Account",
			"This will permanently delete your account and cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => void executeDeleteAccount(),
				},
			],
		);
	};

	const handleLogout = async () => {
		if (isLoggingOut) return;
		setIsLoggingOut(true);
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		} catch (error) {
			handleError(error, "Failed to log out", "Profile Update");
		} finally {
			setIsLoggingOut(false);
		}
	};

	if (isLoading) return null;

	return (
		<Screen className="bg-surface-bg">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerClassName="flex-grow px-6 py-8"
				contentContainerStyle={{
					paddingBottom: Math.max(insets.bottom + 16, 24),
				}}
			>
				<View className="flex-1 w-full max-w-3xl self-center gap-8">
					<View className="flex-col gap-8">
						<PageHeader title="Profile Settings" />

						<AvatarPicker
							displayedAvatar={displayedAvatar}
							avatarDisplayName={avatarDisplayName}
							onPick={handlePickAvatar}
							onRemove={handleRemoveAvatar}
						/>

						<View className="gap-2">
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
								name="email"
								label="Email Address*"
								placeholder="email@address.com"
								keyboardType="email-address"
								autoCapitalize="none"
								error={errors.email?.message}
							/>

							<FormField
								control={control}
								name="password"
								label="New Password"
								placeholder="Leave empty to keep current"
								secureTextEntry
								autoCapitalize="none"
								error={errors.password?.message}
							/>
						</View>
					</View>

					<View className="mt-auto gap-2 pt-4">
						<FilledButton
							onPress={handleSubmit(onSubmit)}
							disabled={isSubmitting || isUpdating}
							label={isSubmitting || isUpdating ? "Saving..." : "Save Profile"}
						/>

						<MutedBorderButton
							onPress={handleLogout}
							disabled={isLoggingOut}
							label={isLoggingOut ? "Logging out..." : "Log out"}
						/>

						<FilledButton
							onPress={handleDeleteAccount}
							disabled={isDeletingAccount}
							variant="danger"
							label={
								isDeletingAccount ? "Deleting account..." : "Delete Account"
							}
						/>
					</View>
				</View>
			</ScrollView>

			<ImagePickerBottomSheet
				ref={imagePickerRef}
				title="Select Profile Photo"
				mode="avatar"
				onImageSelected={handleImageSelected}
				enablePanDownToClose={true}
			/>
		</Screen>
	);
}
