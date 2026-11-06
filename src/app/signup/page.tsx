import { authDestination } from "@/lib/constants/routes";
import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthForm } from "@/features/auth/components/auth-form";
export const metadata: Metadata = { title: "Create your account | BookMyMovie" };
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams;
  const returnTo = authDestination(typeof params.next === "string" ? params.next : null);
  return <AuthShell title="Create your account"><AuthForm mode="signup" returnTo={returnTo} /></AuthShell>;
}
