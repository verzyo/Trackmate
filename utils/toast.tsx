import { X } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import type { ToastConfig as RNToastConfig } from "react-native-toast-message";
import Toast from "react-native-toast-message";

type ToastKind = "success" | "error" | "info";

const ToastCard = ({
	text1,
	text2,
	accentClassName,
}: {
	text1?: string;
	text2?: string;
	accentClassName: string;
}) => (
	<View className="mx-4 w-[90%] flex-row items-center rounded-2xl border border-border bg-surface-fg p-4 shadow-xl">
		<View className={`mr-3 h-10 w-1.5 rounded-full ${accentClassName}`} />
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
);

export const toastConfig: RNToastConfig = {
	success: ({ text1, text2 }) => (
		<ToastCard text1={text1} text2={text2} accentClassName="bg-state-success" />
	),
	error: ({ text1, text2 }) => (
		<ToastCard text1={text1} text2={text2} accentClassName="bg-state-danger" />
	),
	info: ({ text1, text2 }) => (
		<ToastCard
			text1={text1}
			text2={text2}
			accentClassName="bg-action-primary"
		/>
	),
};

export const showToast = (type: ToastKind, title: string, message: string) => {
	Toast.show({
		type,
		text1: title,
		text2: message,
	});
};
