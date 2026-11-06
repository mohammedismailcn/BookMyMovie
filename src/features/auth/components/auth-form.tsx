"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";
import { DEMO_ACCOUNT } from "@/features/auth/services/mock-auth-adapter";
import { authService } from "@/features/auth/services/auth-service";
import { ROUTES, authDestination, loginRoute, signupRoute, isBookingDestination } from "@/lib/constants/routes";

export const FIELD_CLASS = "mt-2 w-full min-w-0 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
export function AuthForm({ mode, initialError = "", returnTo = ROUTES.profile }: { returnTo?: string; mode: "login" | "signup" | "forgot"; initialError?: string }) {
  const auth = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState("");
  const destination = () => authDestination(new URLSearchParams(window.location.search).get("next"));
  useEffect(() => { if (!auth.loading && auth.user && mode !== "forgot") router.replace(authDestination(new URLSearchParams(window.location.search).get("next"))); }, [auth.loading, auth.user, mode, router]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const email = String(fields.get("email") ?? "");
    const password = String(fields.get("password") ?? "");
    setPending(true); setError(""); setSuccess("");
    try {
      if (mode === "forgot") {
        await authService.forgotPassword(email);
        setSuccess("Mock request received. No email was sent and no password was changed. Use the demo credentials or your existing password to log in.");
      } else {
        if (mode === "signup") {
          const result = await auth.signup({ email, password, name: String(fields.get("name") ?? "") });
          if (result.requiresEmailConfirmation) {
            form.reset();
            setSuccess("Check your email for a confirmation link before signing in.");
            return;
          }
        }
        else await auth.login({ email, password }, { fromBooking: isBookingDestination(destination()) });
        form.reset();
        setSuccess(mode === "signup" ? "Account created. Opening your profile…" : "Logged in. Redirecting…");
        router.replace(destination());
        router.refresh();
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to complete the authentication request."); }
    finally { setPending(false); }
  }
  return <>
    <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
      <fieldset disabled={pending || auth.loading || (mode !== "forgot" && !!auth.user)} className="min-w-0 space-y-4 disabled:opacity-70">
        {mode === "signup" && <label className="block text-sm font-medium" htmlFor="name">Name<input id="name" name="name" autoComplete="name" required minLength={2} maxLength={80} className={FIELD_CLASS} /></label>}
        <label className="block text-sm font-medium" htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className={FIELD_CLASS} /></label>
        {mode !== "forgot" && <div><label className="block text-sm font-medium" htmlFor="password">Password<input id="password" name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={mode === "signup" ? 8 : 1} maxLength={128} aria-describedby={mode === "signup" ? "password-help" : undefined} className={FIELD_CLASS} /></label>{mode === "signup" && <span id="password-help" className="mt-1 block text-xs text-muted-foreground">Use 8–128 characters.</span>}</div>}
        <Button type="submit" className="h-10 w-full">{pending ? "Please wait…" : mode === "signup" ? "Create demo account" : mode === "forgot" ? "Simulate reset request" : "Log in"}</Button>
      </fieldset>
      {(error || auth.error) && <p role="alert" className="text-sm text-destructive">{error || auth.error}</p>}
      {success && <p role="status" className="text-sm">{success}</p>}
    </form>

    {mode === "login" && <div className="break-words rounded-lg border p-3 text-xs leading-6"><p className="font-semibold">Try the demo account</p><p>Email: {DEMO_ACCOUNT.email}</p><p>Password: {DEMO_ACCOUNT.password}</p></div>}
    <div className="flex flex-wrap gap-x-4 gap-y-3 text-sm">
      <Link href={mode === "login" ? signupRoute(authDestination(returnTo)) : loginRoute(authDestination(returnTo))} className="underline underline-offset-4 focus-visible:outline-2">{mode === "login" ? "Create an account" : "Back to login"}</Link>
      {mode === "login" && <Link href={ROUTES.forgotPassword} className="underline underline-offset-4 focus-visible:outline-2">Forgot password?</Link>}
    </div>
  </>;
}
