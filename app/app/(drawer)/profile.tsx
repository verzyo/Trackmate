import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { ModalScreen } from "@/components/layout/ModalScreen";
import ImagePickerBottomSheet, {
	type ImagePickerBottomSheetRef,
} from "@/components/overlays/ImagePickerBottomSheet";
import { Avatar } from "@/components/ui/Avatar";
import { FilledButton } from "@/components/ui/FilledButton";
import { FormField } from "@/components/ui/FormField";
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
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<ProfileSettingsForm>({
		resolver: zodResolver(ProfileSettingsFormSchema),
		defaultValues: {
			username: "",
			nickname: "",
			email: "",
			password: "",
			currentPassword: "",
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
			const currentEmail = user?.email ?? "";
			const newEmail = data.email.trim().toLowerCase();
			const isEmailChanged = newEmail !== currentEmail.toLowerCase();
			const isPasswordChanged = !!data.password;

			if (isEmailChanged || isPasswordChanged) {
				if (!data.currentPassword) {
					setError("currentPassword", {
						type: "manual",
						message: "Current password is required to change email or password",
					});
					return;
				}

				const { error: signInError } = await supabase.auth.signInWithPassword({
					email: currentEmail,
					password: data.currentPassword,
				});

				if (signInError) {
					setError("currentPassword", {
						type: "manual",
						message: "Invalid current password",
					});
					return;
				}
			}
			clearErrors("currentPassword");

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

			if (isEmailChanged || isPasswordChanged) {
				const updateData: any = {};
				if (isEmailChanged) updateData.email = newEmail;
				if (isPasswordChanged) updateData.password = data.password;

				const { error: authError } = await supabase.auth.updateUser(updateData);
				if (authError) throw authError;

				if (isEmailChanged) {
					showSuccess(
						"Profile updated. Please check your new email to confirm the change.",
						"Profile Update",
					);
				} else {
					showSuccess("Password updated successfully!", "Profile Update");
				}
			} else {
				showSuccess("Profile updated successfully!", "Profile Update");
			}

			setPendingAvatarUri(null);
			setRemoveAvatarFlag(false);
			setValue("currentPassword", "");
			setValue("password", "");
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
				await supabase.auth.signOut();
			} catch (error) {
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

	if (isLoading && !profile) return null;

	return (
		<ModalScreen
			title="Profile Settings"
			fixedChildren={
				<ImagePickerBottomSheet
					ref={imagePickerRef}
					title="Select Profile Photo"
					mode="avatar"
					onImageSelected={handleImageSelected}
					enablePanDownToClose={true}
				/>
			}
		>
			<View className="items-center gap-4">
				<Avatar
					name={avatarDisplayName}
					imageUrl={displayedAvatar}
					size={128}
					showPickerIcon
					pickerIconType={displayedAvatar ? "edit" : "plus"}
					onPress={handlePickAvatar}
				/>

				{displayedAvatar && (
					<Pressable onPress={handleRemoveAvatar}>
						<Text className="text-state-danger font-bold text-base">
							Remove Photo
						</Text>
					</Pressable>
				)}
			</View>

			<View className="gap-4">
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

				<FormField
					control={control}
					name="currentPassword"
					label="Current Password"
					placeholder="Required to change email or password"
					secureTextEntry
					autoCapitalize="none"
					error={errors.currentPassword?.message}
				/>
			</View>

			<View className="gap-4 pt-4">
				<FilledButton
					onPress={handleSubmit(onSubmit)}
					disabled={isSubmitting || isUpdating}
					label={isSubmitting || isUpdating ? "Saving..." : "Save Profile"}
				/>

				<FilledButton
					onPress={handleLogout}
					disabled={isLoggingOut}
					variant="muted"
					withShadow={false}
					label={isLoggingOut ? "Logging out..." : "Log Out"}
				/>

				<FilledButton
					onPress={handleDeleteAccount}
					disabled={isDeletingAccount}
					variant="danger"
					label={isDeletingAccount ? "Deleting account..." : "Delete Account"}
				/>
			</View>
		</ModalScreen>
	);
}
