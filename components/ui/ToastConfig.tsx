import { X } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import type { ToastConfig as RNToastConfig } from "react-native-toast-message";

export const toastConfig: RNToastConfig = {
	success: ({ text1, text2 }) => (
		<View className="mx-4 w-[90%] flex-row items-center rounded-2xl border border-border bg-surface-fg p-4 shadow-xl">
			<View className="mr-3 h-10 w-1.5 rounded-full bg-state-success" />
			<View className="flex-1">
				{text1 && (
					<Text className="font-bold text-text-strong text-base">{text1}</Text>
				)}
				{text2 && <Text className="text-text-light text-sm">{text2}</Text>}
			</View>
			<Pressable onPress={() => Toast.hide()} className="ml-3 p-1">
				<X size={20} color="gray" />
			</Pressable>
		</View>
	),
	error: ({ text1, text2 }) => (
		<View className="mx-4 w-[90%] flex-row items-center rounded-2xl border border-border bg-surface-fg p-4 shadow-xl">
			<View className="mr-3 h-10 w-1.5 rounded-full bg-state-danger" />
			<View className="flex-1">
				{text1 && (
					<Text className="font-bold text-text-strong text-base">{text1}</Text>
				)}
				{text2 && <Text className="text-text-light text-sm">{text2}</Text>}
			</View>
			<Pressable onPress={() => Toast.hide()} className="ml-3 p-1">
				<X size={20} color="gray" />
			</Pressable>
		</View>
	),
	info: ({ text1, text2 }) => (
		<View className="mx-4 w-[90%] flex-row items-center rounded-2xl border border-border bg-surface-fg p-4 shadow-xl">
			<View className="mr-3 h-10 w-1.5 rounded-full bg-action-primary" />
			<View className="flex-1">
				{text1 && (
					<Text className="font-bold text-text-strong text-base">{text1}</Text>
				)}
				{text2 && <Text className="text-text-light text-sm">{text2}</Text>}
			</View>
			<Pressable onPress={() => Toast.hide()} className="ml-3 p-1">
				<X size={20} color="gray" />
			</Pressable>
		</View>
	),
};
