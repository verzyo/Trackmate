import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CustomDrawerContent } from "@/components/layout/CustomDrawerContent";
import { useThemeColors } from "@/hooks/common/useThemeColors";

export default function DrawerLayout() {
	const colors = useThemeColors();

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
					swipeEnabled: true,
					swipeEdgeWidth: 50,
					swipeMinDistance: 20,
					drawerStyle: {
						width: 280,
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
