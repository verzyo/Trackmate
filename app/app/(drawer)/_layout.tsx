import { useColorScheme } from "nativewind";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CustomDrawerContent } from "@/components/layout/CustomDrawerContent";

export default function DrawerLayout() {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	const colors = {
		surface: isDark ? "#0f172a" : "#f8fafc",
		textStrong: isDark ? "#f1f5f9" : "#0f172a",
	};

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<Drawer
				drawerContent={(props) => <CustomDrawerContent {...props} />}
				screenOptions={{
					headerShown: false,
					drawerType: "front",
					drawerPosition: "right", // Pop out from the right side
					drawerStyle: {
						width: "70%",
						backgroundColor: colors.surface,
					},
					drawerActiveBackgroundColor: "transparent", // Remove highlighting
					drawerActiveTintColor: colors.textStrong,
					drawerInactiveTintColor: colors.textStrong,
					drawerLabelStyle: {
						fontSize: 16,
						fontWeight: "500",
					},
				}}
			>
				<Drawer.Screen
					name="(tabs)"
					options={{
						drawerItemStyle: { display: "none" }, // Remove home from drawer
					}}
				/>
				<Drawer.Screen
					name="invites"
					options={{
						drawerLabel: "Pending Invites",
						title: "Invites",
					}}
				/>
				<Drawer.Screen
					name="profile"
					options={{
						drawerLabel: "Profile Settings",
						title: "Profile",
					}}
				/>
			</Drawer>
		</GestureHandlerRootView>
	);
}
