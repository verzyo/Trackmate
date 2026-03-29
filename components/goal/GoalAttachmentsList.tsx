import { Image } from "expo-image";
import { LinkSimple, Note, X } from "phosphor-react-native";
import React from "react";
import {
	ActivityIndicator,
	Linking,
	Modal,
	Pressable,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import Avatar from "@/components/ui/Avatar";
import { useThemeColors } from "@/hooks/common/useThemeColors";
import { supabase } from "@/lib/supabase";
import type { AttachmentItem } from "@/schemas/goal.schema";

interface GoalAttachmentsListProps {
	attachments: AttachmentItem[];
	loading?: boolean;
}

// Separate component for photo to properly use hooks
function PhotoAttachment({ path }: { path: string }) {
	const [imageUrl, setImageUrl] = React.useState<string | null>(null);
	const [error, setError] = React.useState(false);
	const [previewVisible, setPreviewVisible] = React.useState(false);
	const { width, height } = useWindowDimensions();

	React.useEffect(() => {
		const getSignedUrl = async () => {
			console.log("Fetching signed URL for:", path);
			const { data, error } = await supabase.storage
				.from("attachments")
				.createSignedUrl(path, 60);

			if (error) {
				console.error("Signed URL error:", error);
				setError(true);
				return;
			}

			console.log("Signed URL:", data?.signedUrl);
			setImageUrl(data?.signedUrl || null);
		};

		getSignedUrl();
	}, [path]);

	if (error || !imageUrl) {
		return (
			<View className="items-center justify-center rounded-2xl bg-state-muted-bg p-4">
				<Text className="text-sm text-text-light">Image unavailable</Text>
			</View>
		);
	}

	return (
		<>
			<Pressable onPress={() => setPreviewVisible(true)}>
				<Image
					source={{ uri: imageUrl }}
					style={{
						width: "100%",
						height: 200,
						borderRadius: 16,
					}}
					contentFit="cover"
					transition={300}
					cachePolicy="memory-disk"
					onError={(e) => {
						console.error("Image load error:", e);
						setError(true);
					}}
				/>
			</Pressable>

			<Modal
				visible={previewVisible}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setPreviewVisible(false)}
			>
				<Pressable
					className="flex-1 bg-black/90"
					onPress={() => setPreviewVisible(false)}
				>
					<Pressable
						className="absolute right-4 top-12 z-10 rounded-full bg-black/50 p-2"
						onPress={() => setPreviewVisible(false)}
					>
						<X size={24} color="white" weight="bold" />
					</Pressable>

					<View className="flex-1 items-center justify-center px-4">
						<Pressable onPress={(e) => e.stopPropagation()}>
							<Image
								source={{ uri: imageUrl }}
								style={{
									width: width - 32,
									height: height * 0.7,
									borderRadius: 8,
								}}
								contentFit="contain"
								cachePolicy="memory-disk"
							/>
						</Pressable>
					</View>
				</Pressable>
			</Modal>
		</>
	);
}

export function GoalAttachmentsList({
	attachments,
	loading,
}: GoalAttachmentsListProps) {
	const colors = useThemeColors();

	if (loading) {
		return (
			<View className="w-full gap-3">
				<Text
					className="text-xl font-medium text-text-default"
					style={{ color: colors.textDefault }}
				>
					Recent Attachments
				</Text>
				<View className="items-center justify-center py-8">
					<ActivityIndicator color={colors.actionPrimary} />
				</View>
			</View>
		);
	}

	if (attachments.length === 0) {
		return null;
	}

	return (
		<View className="w-full gap-3">
			<Text
				className="text-xl font-medium text-text-default"
				style={{ color: colors.textDefault }}
			>
				Recent Attachments
			</Text>

			<View className="gap-3">
				{attachments.map((attachment) => (
					<View
						key={attachment.id}
						className="rounded-[24px] border border-border bg-surface-fg p-4"
					>
						{/* User header */}
						<View className="mb-3 flex-row items-center gap-3">
							<Avatar
								name={attachment.nickname || attachment.username}
								imageUrl={attachment.avatar_url ?? undefined}
								size={36}
							/>
							<View>
								<Text
									className="text-base font-semibold text-text-strong"
									style={{ color: colors.textStrong }}
								>
									{attachment.nickname || attachment.username}
								</Text>
								<Text
									className="text-xs text-text-light"
									style={{ color: colors.textLight }}
								>
									{formatDate(attachment.completed_at)}
								</Text>
							</View>
						</View>

						{/* Attachment content */}
						{attachment.attachment_data && (
							<AttachmentContent
								data={attachment.attachment_data}
								colors={colors}
							/>
						)}
					</View>
				))}
			</View>
		</View>
	);
}

// Component to render different attachment types
const AttachmentContent = React.memo(function AttachmentContent({
	data,
	colors,
}: {
	data: { type: string; path?: string; url?: string; content?: string };
	colors: ReturnType<typeof useThemeColors>;
}) {
	switch (data.type) {
		case "photo":
			if (data.path) {
				return <PhotoAttachment path={data.path} />;
			}
			return null;

		case "url":
			if (data.url) {
				const handlePress = async () => {
					try {
						const supported = await Linking.canOpenURL(data.url as string);
						if (supported) {
							await Linking.openURL(data.url as string);
						} else {
							console.log("Cannot open URL:", data.url);
						}
					} catch (error) {
						console.error("Error opening URL:", error);
					}
				};

				return (
					<Pressable
						className="flex-row items-center gap-2 rounded-2xl bg-state-muted-bg px-4 py-3 active:opacity-70"
						onPress={handlePress}
					>
						<LinkSimple size={20} color={colors.actionPrimary} weight="bold" />
						<Text
							className="flex-1 text-base text-action-primary"
							style={{ color: colors.actionPrimary }}
							numberOfLines={1}
							ellipsizeMode="middle"
						>
							{data.url}
						</Text>
					</Pressable>
				);
			}
			return null;

		case "text":
			if (data.content) {
				return (
					<View className="flex-row gap-3 rounded-2xl bg-state-muted-bg p-4">
						<Note
							size={20}
							color={colors.textLight}
							weight="bold"
							style={{ marginTop: 2 }}
						/>
						<Text
							className="flex-1 text-base text-text-default"
							style={{ color: colors.textDefault, lineHeight: 22 }}
						>
							{data.content}
						</Text>
					</View>
				);
			}
			return null;

		default:
			return null;
	}
});

// Format date to readable string
function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}
