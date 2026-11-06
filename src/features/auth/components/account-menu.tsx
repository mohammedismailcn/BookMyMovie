"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, UserRound } from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
export function AccountMenu() {
  const { user, loading, error: authError, logout, openPreferences } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  if (loading) return <span role="status" className="text-xs">Loading account…</span>;
  if (authError) return <span role="status" className="max-w-40 text-xs text-muted-foreground">Account unavailable</span>;
  if (!user) return <Link href={ROUTES.login} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Sign In</Link>;
  return <details className="group relative" onKeyDown={(event) => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}>
    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-ring"><UserRound className="size-4 shrink-0" aria-hidden="true" /><span className="max-w-20 truncate sm:max-w-24">{user.name}</span><ChevronDown className="size-3 shrink-0" aria-hidden="true" /></summary>
    <div className="absolute right-0 z-50 mt-2 w-48 space-y-1 rounded-xl border bg-background p-2 shadow-lg" onClick={(event) => { if (event.target instanceof HTMLAnchorElement) { const details = event.currentTarget.closest("details"); if (details) details.open = false; } }}>
      <Link href={ROUTES.profile} className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm hover:bg-muted focus-visible:outline-2">Profile</Link>
      <Link href={ROUTES.myBookings} className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm hover:bg-muted focus-visible:outline-2">My Bookings</Link>
      <Button variant="ghost" className="h-auto w-full justify-start px-3 py-2" onClick={(event) => {
        const details = event.currentTarget.closest("details");
        if (details) details.open = false;
        openPreferences();
      }}>My Preferences</Button>
      <Button variant="ghost" disabled={pending} className="w-full justify-start" onClick={async () => { setPending(true); setError(""); try { await logout(); router.replace(ROUTES.login); router.refresh(); } catch { setError("Unable to sign out. Please try again."); } finally { setPending(false); } }}>{pending ? "Logging out…" : "Logout"}</Button>
      {error && <p role="alert" className="p-2 text-xs text-destructive">{error}</p>}
    </div>
  </details>;
}
