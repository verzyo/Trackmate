import * as ImagePicker from "expo-image-picker";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const pickAvatar = async () => {
	const result = await ImagePicker.launchImageLibraryAsync({
		mediaTypes: ["images"],
		allowsEditing: true,
		aspect: [1, 1],
		quality: 0.8,
	});

	if (result.canceled) return null;

	const asset = result.assets[0];
	if (asset.fileSize && asset.fileSize > MAX_SIZE)
		throw new Error("Image must be under 5MB");
	if (asset.mimeType && !ALLOWED_TYPES.includes(asset.mimeType))
		throw new Error("Invalid file type");

	return asset;
};
