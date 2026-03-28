import {
	type DrawerContentComponentProps,
	DrawerContentScrollView,
} from "@react-navigation/drawer";
import { type Href, useRouter } from "expo-router";
import { EnvelopeSimple, SignOut, User } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "@/components/ui/Avatar";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { useProfile } from "@/hooks/profile/useProfileHooks";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";

export function CustomDrawerContent(props: DrawerContentComponentProps) {
	const { user } = useAuthStore();
	const { data: profile } = useProfile(user?.id);
	const router = useRouter();
	const colors = useThemeColors();

	const activeRouteName = props.state.routes[props.state.index]?.name;
	const drawerDisplayName = profile?.nickname || profile?.username || "User";

	const menuItems = [
		{
			name: "invites",
			label: "Pending Invites",
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

	return (
		<SafeAreaView
			style={{ flex: 1 }}
			edges={["top", "bottom"]}
			className="bg-surface-bg"
		>
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
				contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16 }}
			>
				<View className="gap-2">
					{menuItems.map((item) => {
						const isActive = activeRouteName === item.name;
						const Icon = item.icon;
						return (
							<Pressable
								key={item.name}
								onPress={() => router.push(item.route)}
								className={`flex-row items-center gap-4 px-4 py-4 rounded-2xl ${
									isActive ? "bg-action-secondary" : "bg-transparent"
								}`}
							>
								<Icon
									size={22}
									weight={isActive ? "bold" : "regular"}
									color={isActive ? colors.actionPrimary : colors.textDefault}
								/>
								<Text
									className={`text-base font-semibold ${
										isActive ? "text-action-primary" : "text-text-default"
									}`}
								>
									{item.label}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</DrawerContentScrollView>

			<View className="p-6 border-t border-border">
				<Pressable
					onPress={() => supabase.auth.signOut()}
					className="flex-row items-center gap-4 py-4 px-4 rounded-2xl bg-state-danger/10"
				>
					<SignOut size={22} color={colors.danger} weight="bold" />
					<Text className="text-state-danger font-bold text-base">Log out</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}
