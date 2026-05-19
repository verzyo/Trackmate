import {
	DrawerContentScrollView,
	type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { useRouter, type Href } from "expo-router";
import { EnvelopeSimple, User } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "@/components/ui/Avatar";
import { FilledButton } from "@/components/ui/FilledButton";
import { useErrorHandler } from "@/hooks/common/useErrorHandler";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { useInvites } from "@/hooks/goal/useGoalQueries";
import { useProfile } from "@/hooks/profile/useProfileHooks";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";

export function DrawerContent(props: DrawerContentComponentProps) {
	const { user } = useAuthStore();
	const { data: profile } = useProfile(user?.id);
	const { data: invites } = useInvites(user?.id);
	const router = useRouter();
	const colors = useThemeColors();
	const { handleError } = useErrorHandler();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const drawerDisplayName = profile?.nickname || profile?.username || "User";

	const pendingInvitesCount = invites?.length ?? 0;

	const menuItems = [
		{
			name: "invites",
			label: `Pending Invites${pendingInvitesCount > 0 ? ` (${pendingInvitesCount})` : ""}`,
			icon: EnvelopeSimple,
			route: "/app/invites" as Href,
		},
		{
			name: "profile",
			label: "Profile Settings",
			icon: User,
			route: "/app/profile" as Href,
		},
	];

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

	return (
		<SafeAreaView edges={["top", "bottom"]} className="bg-surface-bg flex-1">
			<View className="px-6 py-8 border-b border-border bg-surface-bg">
				<View className="flex-row items-center gap-4">
					<Avatar
						size={72}
						name={drawerDisplayName}
						imageUrl={profile?.avatar_url ?? undefined}
					/>
					<View className="flex-1 gap-1">
						<Text
							className="text-text-strong font-bold text-xl tracking-tight"
							numberOfLines={1}
						>
							{drawerDisplayName}
						</Text>
						<Text
							className="text-text-light text-sm font-medium"
							numberOfLines={1}
						>
							{user?.email}
						</Text>
					</View>
				</View>
			</View>

			<DrawerContentScrollView
				{...props}
				contentContainerStyle={{
					paddingTop: 16,
					paddingHorizontal: 16,
					flexGrow: 1,
				}}
			>
				<View className="gap-2 flex-1">
					{menuItems.map((item) => {
						const Icon = item.icon;
						return (
							<Pressable
								key={item.name}
								onPress={() => router.push(item.route)}
								className="flex-row items-center gap-4 px-4 py-4 rounded-2xl bg-transparent"
							>
								<Icon
									size={22}
									weight="regular"
									color={colors.textDefault}
								/>
								<Text
									className="text-base font-semibold"
									style={{ color: colors.textDefault }}
								>
									{item.label}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</DrawerContentScrollView>

			<View className="p-6">
				<FilledButton
					label={isLoggingOut ? "Logging out..." : "Log Out"}
					disabled={isLoggingOut}
					variant="muted"
					withShadow={false}
					onPress={handleLogout}
				/>
			</View>
		</SafeAreaView>
	);
}
