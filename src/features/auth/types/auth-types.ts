export type AuthUser = { id: string; name: string; email: string; createdAt: string };
export type LoginInput = { email: string; password: string };
export type SignupInput = LoginInput & { name: string };
export type ProfileInput = { name: string; email: string };
export type SignupResult = { user: AuthUser | null; requiresEmailConfirmation: boolean };
export type ProfileUpdateResult = { user: AuthUser; emailConfirmationRequired: boolean };
export interface AuthAdapter {
  getCurrentUser(): Promise<AuthUser | null>;
  signup(input: SignupInput): Promise<SignupResult>;
  login(input: LoginInput): Promise<AuthUser>;
  logout(): Promise<void>;
  updateProfile(input: ProfileInput): Promise<ProfileUpdateResult>;
  forgotPassword(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  subscribe(listener: (user: AuthUser | null) => void): () => void;
}
