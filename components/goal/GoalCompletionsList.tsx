import { Image } from "expo-image";
import { memo, useEffect, useState } from "react";
import { Linking, Text, View } from "react-native";
import { ATTACHMENT_TYPES } from "@/constants/attachmentTypes";
import { getSignedUrl } from "@/services/goal.service";

type GoalCompletionsListProps = {
	completions: {
		id: string;
		completed_at: string;
		points_earned: number;
		attachment_data?: {
			type: string;
			path?: string;
			url?: string;
			content?: string;
		} | null;
	}[];
};

function SignedImage({ path }: { path: string }) {
	const [signedUrl, setSignedUrl] = useState<string | null>(null);

	useEffect(() => {
		getSignedUrl(path).then(setSignedUrl);
	}, [path]);

	if (!signedUrl) return <View className="w-20 h-20 bg-neutral-200" />;

	return <Image source={{ uri: signedUrl }} className="w-20 h-20 mt-1" />;
}

export const GoalCompletionsList = memo(function GoalCompletionsList({
	completions,
}: GoalCompletionsListProps) {
	if (!completions || completions.length === 0) return null;

	return (
		<View className="mt-8 w-full">
			<Text className="text-xl font-bold mb-2 text-center">
				Past Completions
			</Text>
			{completions.map((comp) => (
				<View
					key={comp.id}
					className="border-b border-neutral-200 py-3 items-center w-full"
				>
					<Text>Date: {new Date(comp.completed_at).toLocaleDateString()}</Text>
					<Text>Points: {comp.points_earned}</Text>
					{comp.attachment_data && (
						<View className="mt-2 items-center">
							{comp.attachment_data.type === ATTACHMENT_TYPES.PHOTO &&
								comp.attachment_data.path && (
									<SignedImage path={comp.attachment_data.path} />
								)}
							{comp.attachment_data.type === ATTACHMENT_TYPES.URL && (
								<Text
									className="text-blue-500"
									onPress={() =>
										Linking.openURL(comp.attachment_data?.url || "")
									}
								>
									{comp.attachment_data.url}
								</Text>
							)}
							{comp.attachment_data.type === ATTACHMENT_TYPES.TEXT && (
								<Text className="text-neutral-600 mt-1 italic">
									"{comp.attachment_data.content}"
								</Text>
							)}
						</View>
					)}
				</View>
			))}
		</View>
	);
});
