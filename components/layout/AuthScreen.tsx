import { AuthSwitchPrompt } from "@/components/auth/AuthSwitchPrompt";
import { Screen } from "@/components/layout/Screen";
import { cn } from "@/utils/cn";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface AuthScreenProps {
	title: string;
	description: string;
	children: ReactNode;
	redirectPrompt: string;
	redirectAction: string;
	onRedirectPress: () => void;
	contentClassName?: string;
}

export function AuthScreen({
	title,
	description,
	children,
	redirectPrompt,
	redirectAction,
	onRedirectPress,
	contentClassName,
}: AuthScreenProps) {
	return (
		<Screen
			scrollable
			contentContainerClassName="items-center justify-center px-6 py-10"
		>
			<View className="w-full max-w-md gap-10">
				<View className="items-center">
					<Text className="text-4xl font-bold tracking-tight text-text-strong text-center">
						{title}
					</Text>
					<Text className="text-lg font-medium text-text-light mt-2 text-center">
						{description}
					</Text>
				</View>

				<View className={cn("gap-4", contentClassName)}>{children}</View>

				<AuthSwitchPrompt
					promptText={redirectPrompt}
					actionText={redirectAction}
					onPress={onRedirectPress}
				/>
			</View>
		</Screen>
	);
}

export default AuthScreen;
