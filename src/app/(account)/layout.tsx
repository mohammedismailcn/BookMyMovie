import { AuthGate } from "@/features/auth/components/auth-gate";

// Demo UI gate only. Never use browser mock sessions to authorize server operations.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
