import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";

type AuthState = {
	session: Session | null;
	user: User | null;
	initialized: boolean;
	initialize: () => () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
	session: null,
	user: null,
	initialized: false,

	initialize: () => {
		let isActive = true;

		supabase.auth.getSession().then(({ data: { session } }) => {
			if (!isActive) return;
			set({ session, user: session?.user ?? null, initialized: true });
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (!isActive) return;

			if (event === "SIGNED_OUT") {
				queryClient.clear();
			}

			if (event === "USER_UPDATED") {
				queryClient.invalidateQueries({ queryKey: ["profile"] });
			}

			set({ session, user: session?.user ?? null, initialized: true });
		});

		return () => {
			isActive = false;
			subscription.unsubscribe();
		};
	},
}));
