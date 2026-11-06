import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ProfileForm } from "@/features/auth/components/profile-form";
export const metadata: Metadata = { title: "My profile | BookMyMovie" };
export default function ProfilePage() { return <AuthShell title="My profile"><ProfileForm /></AuthShell>; }
