import { Drawer } from "expo-router/drawer";
import { Platform, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CustomDrawerContent } from "@/components/layout/CustomDrawerContent";
import { useThemeColors } from "@/hooks/common/useThemeColors";

export default function DrawerLayout() {
	const colors = useThemeColors();
	const { width } = useWindowDimensions();
	const drawerWidth =
		Platform.OS === "web" ? Math.min(Math.max(width * 0.32, 280), 360) : 280;

	return (
		<GestureHandlerRootView
			style={{ flex: 1, backgroundColor: colors.surfaceBg }}
		>
			<Drawer
				drawerContent={(props) => <CustomDrawerContent {...props} />}
				screenOptions={{
					headerShown: false,
					drawerType: "front",
					drawerPosition: "right",
					swipeEnabled: Platform.OS !== "web",
					swipeEdgeWidth: 50,
					swipeMinDistance: 20,
					drawerStyle: {
						width: drawerWidth,
						backgroundColor: colors.surfaceBg,
					},
					overlayColor: "rgba(0,0,0,0.5)",
					drawerActiveBackgroundColor: "transparent", // Remove highlighting
					drawerActiveTintColor: colors.textStrong,
					drawerInactiveTintColor: colors.textStrong,
					drawerLabelStyle: {
						fontSize: 16,
						fontWeight: "600",
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
