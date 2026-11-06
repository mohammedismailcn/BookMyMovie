"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";
import { FIELD_CLASS } from "@/features/auth/components/auth-form";
import { ROUTES } from "@/lib/constants/routes";
export function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  if (!user) return null;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setPending(true); setError(""); setSuccess("");
    try { const result = await updateProfile({ name: String(fields.get("name") ?? ""), email: String(fields.get("email") ?? "") }); setSuccess(result.emailConfirmationRequired ? "Profile saved. Check your email to confirm the address change." : "Demo profile saved."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save profile."); }
    finally { setPending(false); }
  }
  return <><form onSubmit={submit} className="space-y-4" aria-busy={pending}>
    <fieldset disabled={pending} className="min-w-0 space-y-4" key={`${user.id}:${user.name}:${user.email}`}>
      <label htmlFor="profile-name" className="block text-sm font-medium">Name<input id="profile-name" name="name" defaultValue={user.name} required minLength={2} maxLength={80} autoComplete="name" className={FIELD_CLASS} /></label>
      <label htmlFor="profile-email" className="block text-sm font-medium">Email<input id="profile-email" name="email" type="email" defaultValue={user.email} required maxLength={254} autoComplete="email" className={FIELD_CLASS} /></label>
      <Button type="submit" className="h-10 w-full">{pending ? "Saving…" : "Save profile"}</Button>
    </fieldset>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{success && <p role="status" className="text-sm">{success}</p>}
  </form><Link href={ROUTES.myBookings} className="inline-block text-sm underline underline-offset-4">View my bookings</Link></>;
}
