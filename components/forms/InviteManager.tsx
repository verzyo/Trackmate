import { useState } from "react";
import { Button, Pressable, Text, TextInput, View } from "react-native";

export type Invitee = {
	id: string;
	username: string;
};

type InviteManagerProps = {
	invitees: Invitee[];
	onAdd: (username: string) => Promise<void>;
	onRemove: (id: string) => void;
};

export function InviteManager({
	invitees,
	onAdd,
	onRemove,
}: InviteManagerProps) {
	const [inviteUsername, setInviteUsername] = useState("");
	const [isAdding, setIsAdding] = useState(false);

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
		<View className="w-full items-center mt-2">
			<Text className="font-bold text-lg">Invite Users</Text>
			<TextInput
				value={inviteUsername}
				onChangeText={setInviteUsername}
				placeholder="username"
				autoCapitalize="none"
				className="text-center mt-2 mb-4"
			/>
			<Button
				title={isAdding ? "Adding..." : "Add to Invites"}
				onPress={handleAdd}
				disabled={!inviteUsername.trim() || isAdding}
			/>

			{invitees.length > 0 && (
				<View className="mt-4 w-full px-4">
					<Text className="text-sm font-semibold mb-2 text-center">
						To be invited:
					</Text>
					{invitees.map((invitee) => (
						<View
							key={invitee.id}
							className="flex-row justify-between items-center py-2 border-b border-neutral-200 w-full"
						>
							<Text>{invitee.username}</Text>
							<Pressable onPress={() => onRemove(invitee.id)}>
								<Text className="text-red-500 font-bold">REMOVE</Text>
							</Pressable>
						</View>
					))}
				</View>
			)}
		</View>
	);
}
