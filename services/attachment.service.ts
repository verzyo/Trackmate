import { uploadFile } from "@/utils/upload";

export const uploadAttachment = async (
	userId: string,
	uri: string,
	mimeType: string,
): Promise<string> => {
	const filename = `${Date.now()}_${uri.split("/").pop()}`;
	const path = `${userId}/${filename}`;
	await uploadFile("attachments", path, uri, mimeType, filename);

	return path;
};
