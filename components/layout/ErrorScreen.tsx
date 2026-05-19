import React from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { cn } from "@/utils/cn";

interface Props {
	children: React.ReactNode;
}

interface State {
	hasError: boolean;
}

function ErrorUI({ onReset }: { onReset: () => void }) {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<View className={cn(isDark && "dark")} style={{ flex: 1 }}>
			<View
				style={{ flex: 1 }}
				className="items-center justify-center bg-surface-bg px-6"
			>
				<Text className="text-text-strong font-bold text-xl text-center">
					Something went wrong
				</Text>
				<Text className="text-text-light text-base text-center mt-2">
					Please restart the app.
				</Text>
				<Pressable
					onPress={onReset}
					className="mt-6 h-12 px-5 rounded-xl bg-action-primary items-center justify-center"
				>
					<Text className="text-white font-bold">Try again</Text>
				</Pressable>
			</View>
		</View>
	);
}

export class ErrorScreen extends React.Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return <ErrorUI onReset={() => this.setState({ hasError: false })} />;
		}

		return this.props.children;
	}
}
