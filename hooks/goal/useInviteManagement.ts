import { useState } from "react";
import type { Invitee } from "@/components/forms/InviteManager";
import { fetchProfileByUsername } from "@/services/profile.service";
import { getErrorMessage, showAlert } from "@/utils/error.utils";

export function useInviteManagement(
	userId: string | undefined,
	existingParticipants: string[] = [],
) {
	const [invitees, setInvitees] = useState<Invitee[]>([]);

	const addInvite = async (username: string) => {
		if (!userId) return;

		try {
			const profile = await fetchProfileByUsername(username);

			if (!profile) {
				showAlert("User not found");
				return;
			}
			if (profile.id === userId) {
				showAlert("You cannot invite yourself");
				return;
			}
			if (existingParticipants.includes(profile.id)) {
				showAlert("User is already a participant");
				return;
			}
			if (invitees.some((p) => p.id === profile.id)) {
				showAlert("User already added to invites");
				return;
			}

			setInvitees((prev) => [
				...prev,
				{ id: profile.id, username: profile.username },
			]);
		} catch (e) {
			showAlert(getErrorMessage(e, "Failed to find user"));
		}
	};

	const removeInvite = (id: string) => {
		setInvitees((prev) => prev.filter((p) => p.id !== id));
	};

	return {
		invitees,
		addInvite,
		removeInvite,
	};
}
