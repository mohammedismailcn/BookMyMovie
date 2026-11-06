import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthForm } from "@/features/auth/components/auth-form";
export const metadata: Metadata = { title: "Forgot your password? | BookMyMovie" };
export default function Page() { return <AuthShell title="Forgot your password?"><AuthForm mode="forgot" /></AuthShell>; }
