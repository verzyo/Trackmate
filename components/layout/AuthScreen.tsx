import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { cn } from "@/utils/cn";

interface AuthScreenProps {
	title: string;
	description: string;
	children: ReactNode;
	redirectPrompt: string;
	redirectAction: string;
	onRedirectPress: () => void;
	contentClassName?: string;
}

type AuthSwitchProps = {
	promptText: string;
	actionText: string;
	onPress: () => void;
};

function AuthSwitch({ promptText, actionText, onPress }: AuthSwitchProps) {
	return (
		<View className="flex-row items-center justify-center gap-2">
			<Text className="text-text-light font-medium text-base">
				{promptText}
			</Text>
			<Pressable onPress={onPress}>
				<Text className="text-action-primary font-bold text-base">
					{actionText}
				</Text>
			</Pressable>
		</View>
	);
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

				<AuthSwitch
					promptText={redirectPrompt}
					actionText={redirectAction}
					onPress={onRedirectPress}
				/>
			</View>
		</Screen>
	);
}

export default AuthScreen;
