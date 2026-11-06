"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/auth-provider";
import { loginRoute } from "@/lib/constants/routes";
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => { if (!loading && !user && !error) router.replace(loginRoute(pathname)); }, [loading, user, error, pathname, router]);
  if (loading || !user) return <main className="flex-1 px-5 py-16" role="status">{error || "Checking session…"}</main>;
  return <>{children}</>;
}
