import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
export const metadata: Metadata = { title: "Reset password | BookMyMovie" };
export default function ResetPasswordPage() { return <AuthShell title="Choose a new password"><ResetPasswordForm /></AuthShell>; }
