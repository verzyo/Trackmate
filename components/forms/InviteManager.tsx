import { X } from "phosphor-react-native";
import { useRef, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import Avatar from "@/components/ui/Avatar";
import { useThemeColors } from "@/hooks/common/useThemeColors";

export type Invitee = {
	id: string;
	username: string;
	nickname?: string;
	avatar_url?: string;
};

type InviteManagerProps = {
	invitees: Invitee[];
	onAdd: (username: string) => Promise<void>;
	onRemove: (id: string) => void;
	onInputFocus?: (input: TextInput | null) => void;
	onInputPress?: (input: TextInput | null) => void;
};

export function InviteManager({
	invitees,
	onAdd,
	onRemove,
	onInputFocus,
	onInputPress,
}: InviteManagerProps) {
	const colors = useThemeColors();
	const [inviteUsername, setInviteUsername] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const inputRef = useRef<TextInput>(null);

	const handleAdd = async () => {
		if (!inviteUsername.trim()) return;
		setIsAdding(true);
		try {
			await onAdd(inviteUsername.trim());
			setInviteUsername("");
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<View className="w-full gap-4">
			<View className="flex-row items-center gap-2">
				<TextInput
					ref={inputRef}
					value={inviteUsername}
					onChangeText={setInviteUsername}
					onFocus={() => onInputFocus?.(inputRef.current)}
					onPressIn={() => onInputPress?.(inputRef.current)}
					placeholder="username"
					autoCapitalize="none"
					className="flex-1 h-14 rounded-full border border-border bg-surface-fg px-5 text-base text-text-strong"
					placeholderTextColor={colors.textLight}
				/>
				<Pressable
					onPress={handleAdd}
					disabled={!inviteUsername.trim() || isAdding}
					className="h-14 px-6 bg-action-primary rounded-full items-center justify-center disabled:opacity-50"
				>
					{isAdding ? (
						<ActivityIndicator color="white" size="small" />
					) : (
						<Text className="text-white font-bold text-base">Invite</Text>
					)}
				</Pressable>
			</View>

			{invitees.length > 0 && (
				<View className="gap-2">
					{invitees.map((invitee) => (
						<View
							key={invitee.id}
							className="flex-row items-center justify-between p-3 pl-4 rounded-full border border-border bg-surface-fg"
						>
							<View className="flex-row items-center gap-3">
								<Avatar
									name={invitee.nickname || invitee.username}
									imageUrl={invitee.avatar_url}
									size={44}
								/>
								<View>
									<Text
										className="font-bold text-text-strong text-base"
										style={{ color: colors.textStrong }}
									>
										{invitee.nickname || invitee.username}
									</Text>
									<Text
										className="text-text-light text-xs"
										style={{ color: colors.textLight }}
									>
										@{invitee.username}
									</Text>
								</View>
							</View>
							<View className="flex-row items-center gap-3">
								<View className="bg-state-muted-bg px-3 py-1.5 rounded-full">
									<Text
										className="text-state-muted-fg font-bold text-[10px] tracking-widest"
										style={{ color: colors.textLight }}
									>
										PENDING
									</Text>
								</View>
								<Pressable
									onPress={() => onRemove(invitee.id)}
									hitSlop={8}
									className="p-1"
								>
									<X size={20} color={colors.textLight} weight="bold" />
								</Pressable>
							</View>
						</View>
					))}
				</View>
			)}
		</View>
	);
}
