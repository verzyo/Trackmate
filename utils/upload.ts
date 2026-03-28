import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

export const uploadFile = async (
	bucket: string,
	path: string,
	uri: string,
	mimeType: string,
	filename?: string,
): Promise<void> => {
	let fileBody: FormData | Blob;
	const options: { upsert: boolean; contentType?: string } = { upsert: true };

	if (Platform.OS === "web") {
		const response = await fetch(uri);
		fileBody = await response.blob();
		options.contentType = mimeType;
	} else {
		fileBody = new FormData();
		fileBody.append("file", {
			uri,
			name: filename ?? path.split("/").pop() ?? "upload.bin",
			type: mimeType,
		} as unknown as Blob);
	}

	const { error } = await supabase.storage
		.from(bucket)
		.upload(path, fileBody, options);
	if (error) throw error;
};
