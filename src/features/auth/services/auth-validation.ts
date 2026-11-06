import type { ProfileInput, SignupInput } from "@/features/auth/types/auth-types";
export function normalizeEmail(email: string): string { return email.trim().toLowerCase(); }
export function validateEmail(email: string): void {
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
}
export function validateProfile(input: ProfileInput): void {
  if (input.name.trim().length < 2 || input.name.trim().length > 80) throw new Error("Name must contain 2–80 characters.");
  validateEmail(input.email);
}
export function validateSignup(input: SignupInput): void {
  validateProfile(input);
  validatePassword(input.password);
}

export function validatePassword(password: string): void {
  if (password.length < 8 || password.length > 128) throw new Error("Password must contain 8-128 characters.");
}
