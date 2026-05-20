import { router } from "expo-router";
import { ArrowLeft, PencilSimple } from "phosphor-react-native";
import React, { type ReactNode } from "react";
import { type ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/layout/Screen";
import { ModalButton } from "@/components/ui/ModalButton";
import { cn } from "@/utils/cn";

type ModalScreenVariant = "default" | "edit";

interface ModalScreenProps {
	title: string;
	variant?: ModalScreenVariant;
	onBack?: () => void;
	onEdit?: () => void;
	children: ReactNode;
	contentContainerClassName?: string;
	contentContainerStyle?: any;
	refreshControl?: React.ReactElement<any>;
	fixedChildren?: ReactNode;
}

export const ModalScreen = React.forwardRef<ScrollView, ModalScreenProps>(
	(
		{
			title,
			variant = "default",
			onBack,
			onEdit,
			children,
			contentContainerClassName,
			contentContainerStyle,
			refreshControl,
			fixedChildren,
		},
		ref,
	) => {
		const insets = useSafeAreaInsets();

		const handleBack = () => {
			if (onBack) {
				onBack();
				return;
			}
			if (router.canGoBack()) {
				router.back();
			} else {
				router.replace("/app");
			}
		};

		return (
			<Screen
				ref={ref}
				scrollable
				refreshControl={refreshControl}
				fixedChildren={fixedChildren}
				contentContainerClassName={cn("px-6 pt-8", contentContainerClassName)}
				contentContainerStyle={
					contentContainerStyle || {
						paddingBottom: Math.max(insets.bottom + 16, 24),
					}
				}
			>
				<View className="flex-1 w-full max-w-3xl self-center">
					<View className="mb-6 h-16 w-full flex-row items-center justify-between">
						<ModalButton icon={ArrowLeft} onPress={handleBack} />

						<Text className="flex-1 text-center font-bold text-2xl text-text-strong">
							{title}
						</Text>

						{variant === "edit" ? (
							<ModalButton icon={PencilSimple} onPress={onEdit!} />
						) : (
							<View className="w-12" />
						)}
					</View>

					<View className="flex-1 gap-8">{children}</View>
				</View>
			</Screen>
		);
	},
);

export default ModalScreen;
