import type { AuthAdapter } from "@/features/auth/types/auth-types";
import { mockAuthAdapter } from "@/features/auth/services/mock-auth-adapter";

export const authService: AuthAdapter = mockAuthAdapter;
