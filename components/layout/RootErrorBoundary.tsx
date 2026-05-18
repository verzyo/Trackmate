import React from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
	children: React.ReactNode;
}

interface State {
	hasError: boolean;
}

export class RootErrorBoundary extends React.Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return (
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
						onPress={() => this.setState({ hasError: false })}
						className="mt-6 h-12 px-5 rounded-xl bg-action-primary items-center justify-center"
					>
						<Text className="text-white font-bold">Try again</Text>
					</Pressable>
				</View>
			);
		}

		return this.props.children;
	}
}