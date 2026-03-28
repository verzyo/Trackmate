import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
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
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!isActive) return;
			set({ session, user: session?.user ?? null, initialized: true });
		});

		return () => {
			isActive = false;
			subscription.unsubscribe();
		};
	},
}));
