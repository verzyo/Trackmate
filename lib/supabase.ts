import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as aesjs from "aes-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import "react-native-get-random-values";
import { z } from "zod";

// As Expo's SecureStore does not support values larger than 2048
// bytes, an AES-256 key is generated and stored in SecureStore, while
// it is used to encrypt/decrypt values stored in AsyncStorage.
class LargeSecureStore {
	private async _encrypt(key: string, value: string) {
		const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));

		const cipher = new aesjs.ModeOfOperation.ctr(
			encryptionKey,
			new aesjs.Counter(1),
		);
		const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

		await SecureStore.setItemAsync(
			key,
			aesjs.utils.hex.fromBytes(encryptionKey),
		);

		return aesjs.utils.hex.fromBytes(encryptedBytes);
	}

	private async _decrypt(key: string, value: string) {
		const encryptionKeyHex = await SecureStore.getItemAsync(key);
		if (!encryptionKeyHex) {
			return encryptionKeyHex;
		}

		const cipher = new aesjs.ModeOfOperation.ctr(
			aesjs.utils.hex.toBytes(encryptionKeyHex),
			new aesjs.Counter(1),
		);
		const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

		return aesjs.utils.utf8.fromBytes(decryptedBytes);
	}

	async getItem(key: string) {
		const encrypted = await AsyncStorage.getItem(key);
		if (!encrypted) {
			return encrypted;
		}

		return await this._decrypt(key, encrypted);
	}

	async removeItem(key: string) {
		await AsyncStorage.removeItem(key);
		await SecureStore.deleteItemAsync(key);
	}

	async setItem(key: string, value: string) {
		const encrypted = await this._encrypt(key, value);

		await AsyncStorage.setItem(key, encrypted);
	}
}

const envSchema = z.object({
	EXPO_PUBLIC_SUPABASE_URL: z.url(),
	EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const env = envSchema.parse({
	EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
	EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
		process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

const storage =
	Platform.OS === "web"
		? typeof window === "undefined"
			? undefined
			: {
					getItem: (key: string) => window.localStorage.getItem(key),
					setItem: (key: string, value: string) =>
						window.localStorage.setItem(key, value),
					removeItem: (key: string) => window.localStorage.removeItem(key),
				}
		: new LargeSecureStore();

const auth = {
	autoRefreshToken: true,
	persistSession: true,
	detectSessionInUrl: false,
	...(storage ? { storage } : {}),
};

export const supabase: SupabaseClient = createClient(
	env.EXPO_PUBLIC_SUPABASE_URL,
	env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
	{
		auth,
	},
);
