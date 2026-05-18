import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";

const Logo = () => (
	<View style={{ width: 80, height: 80 }}>
		<Image
			source={require("@/assets/images/logo.png")}
			style={{ width: "100%", height: "100%" }}
			resizeMode="contain"
		/>
	</View>
);

const Button = ({
	children,
	variant = "primary",
	onPress,
}: {
	children: React.ReactNode;
	variant?: "primary" | "secondary";
	onPress?: () => void;
}) => (
	<Pressable
		onPress={onPress}
		style={{
			paddingHorizontal: 32,
			paddingVertical: 16,
			borderRadius: 12,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: variant === "primary" ? "#4f46e5" : "#ffffff",
			borderWidth: variant === "secondary" ? 1 : 0,
			borderColor: "#e2e8f0",
		}}
	>
		<Text
			style={{
				fontSize: 16,
				fontWeight: "600",
				color: variant === "primary" ? "#ffffff" : "#0f172a",
			}}
		>
			{children}
		</Text>
	</Pressable>
);

const FeatureSection = ({
	image,
	title,
	description,
	reversed = false,
}: {
	image: any;
	title: string;
	description: string;
	reversed?: boolean;
}) => (
	<View
		style={{
			width: "100%",
			flexDirection: reversed ? "row-reverse" : "row",
			alignItems: "center",
			gap: 24,
			paddingVertical: 0,
			paddingHorizontal: 0,
			flexWrap: "wrap",
			justifyContent: "center",
		}}
	>
		<View style={{ width: 280, maxWidth: "100%" }}>
			<Image
				source={image}
				style={{
					width: "100%",
					height: 500,
					borderRadius: 16,
				}}
				resizeMode="contain"
			/>
		</View>
		<View
			style={{
				flex: 1,
				minWidth: 280,
				alignItems: "center",
				maxWidth: 400,
			}}
		>
			<Text
				style={{
					fontSize: 28,
					fontWeight: "700",
					color: "#0f172a",
					marginBottom: 16,
					textAlign: "center",
				}}
			>
				{title}
			</Text>
			<Text
				style={{
					fontSize: 16,
					color: "#64748b",
					lineHeight: 24,
					textAlign: "center",
				}}
			>
				{description}
			</Text>
		</View>
	</View>
);

export default function LandingScreen() {
	const _router = useRouter();

	return (
		<Screen className="bg-white">
			<ScrollView
				className="flex-1"
				contentContainerClassName="items-center"
				showsVerticalScrollIndicator={false}
			>
				<View className="items-center py-20 px-6 max-w-[768px]">
					<Logo />
					<Text className="text-5xl font-bold text-text-strong text-center mt-6">
						Trackmate
					</Text>
					<Text className="text-xl text-text-light text-center mt-3">
						Goal tracking, socialized.
					</Text>
					<Text className="text-base text-text-light/80 text-center mt-4 max-w-[448px]">
						Set goals, track progress, and achieve more together with friends.
						Compete on leaderboards and stay accountable.
					</Text>

					<View className="flex-row gap-4 mt-10 flex-wrap justify-center">
						<Button
							onPress={() => {
								window.location.href = "/app";
							}}
						>
							Open Web App
						</Button>
						<Button
							variant="secondary"
							onPress={() => {
								window.open(
									"https://expo.dev/artifacts/eas/iHKvgauXFrbE1ZSmgH2QcW.apk",
									"_blank",
								);
							}}
						>
							Download APK
						</Button>
					</View>
				</View>

				<View className="w-full h-[1px] bg-border" />

				<View className="w-full max-w-[1152px]">
					<FeatureSection
						image={require("@/assets/images/home_screen.png")}
						title="Track Together"
						description="See what goals your friends are working on. Share progress, celebrate wins, and keep each other motivated through friendly competition."
					/>

					<FeatureSection
						image={require("@/assets/images/create_goal.png")}
						title="Set Up in Seconds"
						description="Creating goals is effortless. Customize check-in frequencies, and invite friends to join your goals for extra accountability."
						reversed
					/>

					<FeatureSection
						image={require("@/assets/images/goal_progress.png")}
						title="Climb the Leaderboard"
						description="Earn points for every check-in and see how you rank against friends. Visualize your streaks and stay motivated to reach the top."
					/>
				</View>

				<View className="py-12 px-4">
					<Text className="text-sm text-text-light text-center">
						Trackmate — Goals are better together.
					</Text>
				</View>
			</ScrollView>
		</Screen>
	);
}
