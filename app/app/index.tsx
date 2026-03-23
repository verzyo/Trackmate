import { Button, Text } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { supabase } from "@/lib/supabase";

export default function HomeScreen() {
	return (
		<Screen className="items-center justify-center gap-4">
			<Text>Home screen</Text>
			<Button
				title="Log out"
				onPress={() => supabase.auth.signOut()}
				color="red"
			/>
		</Screen>
	);
}
