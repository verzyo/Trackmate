import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Image } from "expo-image";
import { SignOut } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/profile/useProfileHooks";
import { useAuthStore } from "@/store/auth.store";

export function CustomDrawerContent(props: any) {
	const { user } = useAuthStore();
	const { data: profile } = useProfile(user?.id);

	return (
		<SafeAreaView
			style={{ flex: 1 }}
			edges={["top", "bottom"]}
			className="bg-surface-bg"
		>
			<View className="px-5 py-6 border-b border-border bg-surface-bg">
				<View className="flex-row items-center gap-3">
					{profile?.avatar_url ? (
						<Image
							source={{ uri: profile.avatar_url }}
							className="h-12 w-12 rounded-full bg-state-muted-bg"
						/>
					) : (
						<View className="h-12 w-12 rounded-full bg-state-muted-bg items-center justify-center">
							<Text className="text-text-light font-bold text-lg">
								{profile?.username?.[0]?.toUpperCase() ?? "U"}
							</Text>
						</View>
					)}
					<View className="flex-1">
						<Text className="text-text-strong font-bold text-lg" numberOfLines={1}>
							{profile?.username ?? "User"}
						</Text>
						<Text className="text-text-light text-sm" numberOfLines={1}>
							{user?.email}
						</Text>
					</View>
				</View>
			</View>

			<DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
				<DrawerItemList {...props} />
			</DrawerContentScrollView>

			<View className="p-6 border-t border-border">
				<Pressable
					onPress={() => supabase.auth.signOut()}
					className="flex-row items-center gap-3 py-3"
				>
					<SignOut size={24} color="var(--color-state-danger)" />
					<Text className="text-state-danger font-medium text-base">Log out</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}
