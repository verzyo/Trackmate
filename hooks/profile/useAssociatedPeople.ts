import { useQuery } from "@tanstack/react-query";
import { fetchAssociatedPeople } from "@/services/profile.service";

export const associatedPeopleKeys = {
	all: ["associatedPeople"] as const,
	forUser: (userId: string, excludeIds: string[]) =>
		[...associatedPeopleKeys.all, userId, excludeIds] as const,
};

export function useAssociatedPeople(
	userId: string | undefined,
	excludeUserIds: string[] = [],
) {
	return useQuery({
		queryKey: associatedPeopleKeys.forUser(userId ?? "", excludeUserIds),
		queryFn: () => {
			if (!userId) return [];
			return fetchAssociatedPeople(userId, excludeUserIds);
		},
		enabled: !!userId,
	});
}
