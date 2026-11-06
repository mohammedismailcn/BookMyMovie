"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FIELD_CLASS } from "@/features/auth/components/auth-form";
import { authService } from "@/features/auth/services/auth-service";
import { ROUTES } from "@/lib/constants/routes";
export function ResetPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const password = String(fields.get("password") ?? "");
    if (password !== fields.get("confirmPassword")) { setError("Passwords must match."); return; }
    setPending(true); setError("");
    try { await authService.updatePassword(password); form.reset(); setSuccess(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update password."); }
    finally { setPending(false); }
  }
  return <><form onSubmit={submit} className="space-y-4" aria-busy={pending}><fieldset disabled={pending || success} className="space-y-4">
    <label htmlFor="new-password" className="block text-sm font-medium">New password<input id="new-password" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} className={FIELD_CLASS} /></label>
    <label htmlFor="confirm-password" className="block text-sm font-medium">Confirm new password<input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} className={FIELD_CLASS} /></label>
    <Button type="submit" className="h-10 w-full">{pending ? "Saving…" : "Update password"}</Button>
  </fieldset>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}{success && <p role="status" className="text-sm">Your demo password has been updated in this browser only.</p>}</form><Link href={ROUTES.profile} className="inline-block text-sm underline underline-offset-4">Continue to profile</Link></>;
}
