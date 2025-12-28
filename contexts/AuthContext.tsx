"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";

type Profile = Tables<"profiles">;

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (
    email: string,
    password: string,
    profileData: { companyName: string; tradeType: string }
  ) => Promise<{ error: Error | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
  });

  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    setState((prev) => ({ ...prev, profile }));
  }, [state.user, fetchProfile]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let profile: Profile | null = null;

      if (session?.user) {
        profile = await fetchProfile(session.user.id);
      }

      setState({
        user: session?.user ?? null,
        profile,
        session,
        isLoading: false,
      });
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        let profile: Profile | null = null;

        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }

        setState({
          user: session?.user ?? null,
          profile,
          session,
          isLoading: false,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signUp = async (
    email: string,
    password: string,
    profileData: { companyName: string; tradeType: string }
  ): Promise<{ error: Error | null }> => {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: profileData.companyName,
          trade_type: profileData.tradeType,
        },
      },
    });

    if (signUpError) {
      return { error: signUpError };
    }

    return { error: null };
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
