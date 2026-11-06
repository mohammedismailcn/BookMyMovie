"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";
import { loginRoute } from "@/lib/constants/routes";

export function BookingButton({ destination, onAuthenticated, children, ...props }: Omit<React.ComponentProps<typeof Button>, "onClick" | "render" | "nativeButton"> & { destination: string; onAuthenticated?: () => void }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  return <Button {...props} disabled={loading || props.disabled} onClick={() => {
    if (!user) router.push(loginRoute(destination));
    else if (onAuthenticated) onAuthenticated();
    else router.push(destination);
  }}>{children}</Button>;
}
