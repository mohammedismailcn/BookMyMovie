"use client";
import { SeatPreferencesModal } from "@/features/recommendations/components/seat-preferences-modal";
import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/features/auth/services/auth-service";
import type { AuthUser, LoginInput, SignupInput, ProfileInput, SignupResult, ProfileUpdateResult } from "@/features/auth/types/auth-types";

type AuthContextValue = {
  user: AuthUser | null; loading: boolean; error: string;
  login(input: LoginInput, options?: { fromBooking?: boolean }): Promise<void>; signup(input: SignupInput): Promise<SignupResult>;
  logout(): Promise<void>; updateProfile(input: ProfileInput): Promise<ProfileUpdateResult>;
  openPreferences(): void;
};
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [preferencesPromptUserId,setPreferencesPromptUserId]=useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let revision = 0;
    let unsubscribe = () => {};
    try {
      unsubscribe = authService.subscribe((current) => {
        revision += 1;
        if (active) { setUser(current); setLoading(false); setError(""); }
      });
      const initialRevision = revision;
      authService.getCurrentUser().then((current) => {
        if (active && revision === initialRevision) { setUser(current); setLoading(false); setError(""); }
      }).catch((cause: unknown) => {
        if (active && revision === initialRevision) { setUser(null); setLoading(false); setError(cause instanceof Error ? cause.message : "Unable to initialize authentication."); }
      });
    } catch (cause) {
      // Keep the first render in loading state, including storage initialization failures.
      Promise.resolve().then(() => {
        if (active) { setLoading(false); setError(cause instanceof Error ? cause.message : "Unable to initialize authentication."); }
      });
    }
    return () => { active = false; unsubscribe(); };
  }, []);
  const value: AuthContextValue = {
    user, loading, error,
    openPreferences() { if (user) setPreferencesPromptUserId(user.id); },
    async login(input, options) { const current=await authService.login(input); setUser(current); setError(""); setPreferencesPromptUserId(options?.fromBooking ? null : current.id); },
    async signup(input) { const result = await authService.signup(input); setUser(result.user); setError(""); return result; },
    async logout() { await authService.logout(); setPreferencesPromptUserId(null); setUser(null); setError(""); },
    async updateProfile(input) { const result = await authService.updateProfile(input); setUser(result.user); return result; },
  };
  return <AuthContext.Provider value={value}>{children}{user && preferencesPromptUserId===user.id && <SeatPreferencesModal key={user.id} userId={user.id} onClose={()=>setPreferencesPromptUserId(null)} />}</AuthContext.Provider>;
}
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth requires AuthProvider.");
  return value;
}
