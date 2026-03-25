import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

export const uploadAttachment = async (
	userId: string,
	uri: string,
	mimeType: string,
): Promise<string> => {
	const filename = `${Date.now()}_${uri.split("/").pop()}`;
	const path = `${userId}/${filename}`;

	let fileBody: FormData | Blob;
	const options: { upsert?: boolean; contentType?: string } = { upsert: true };

	if (Platform.OS === "web") {
		const response = await fetch(uri);
		fileBody = await response.blob();
		options.contentType = mimeType;
	} else {
		fileBody = new FormData();
		fileBody.append("file", {
			uri,
			name: filename,
			type: mimeType,
		} as unknown as Blob);
	}

	const { error } = await supabase.storage
		.from("attachments")
		.upload(path, fileBody, options);
	if (error) throw error;

	return path;
};
