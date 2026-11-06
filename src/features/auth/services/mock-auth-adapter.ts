// DEMO ONLY. Browser accounts and editable sessions confer no server authorization.
import type { AuthAdapter, AuthUser } from "@/features/auth/types/auth-types";
import { normalizeEmail, validateEmail, validateProfile, validateSignup, validatePassword } from "@/features/auth/services/auth-validation";

export const DEMO_ACCOUNT = { id: "b19ccdbb-1ef0-4f35-a352-2405c92a68f1", name: "Demo Moviegoer", email: "demo@bookmymovie.com", password: "Demo123!" } as const;
export const AUTH_STORAGE_KEY = "bookmymovie.demo-auth.v1";
const SESSION_KEY = "bookmymovie.demo-session.v1";
type Account = { user: AuthUser; salt: string; verifier: string };
function isAccount(value: unknown): value is Account {
  if (!value || typeof value !== "object" || !("user" in value) || !("salt" in value) || !("verifier" in value)) return false;
  const user = value.user;
  return typeof value.salt === "string" && typeof value.verifier === "string" && !!user && typeof user === "object" &&
    "id" in user && typeof user.id === "string" && "name" in user && typeof user.name === "string" &&
    "email" in user && typeof user.email === "string" && "createdAt" in user && typeof user.createdAt === "string";
}
function readAccounts(): Account[] {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return [];
  try { const value: unknown = JSON.parse(raw); if (Array.isArray(value) && value.every(isAccount)) return value; }
  catch { /* Invalid demo JSON is reported below. */ }
  throw new Error("Demo account data is damaged. Clear this site's browser storage to reset it.");
}
function saveAccounts(value: Account[]): void { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value)); }
async function verifier(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256);
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function accounts(): Promise<Account[]> {
  const existing = readAccounts();
  if (existing.some((account) => account.user.id === DEMO_ACCOUNT.id)) return existing;
  const salt = crypto.randomUUID();
  const hash = await verifier(DEMO_ACCOUNT.password, salt);
  const latest = readAccounts();
  if (!latest.some((account) => account.user.id === DEMO_ACCOUNT.id)) {
    latest.push({ user: { id: DEMO_ACCOUNT.id, name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email, createdAt: new Date().toISOString() }, salt, verifier: hash });
    saveAccounts(latest);
  }
  return latest;
}
export const mockAuthAdapter: AuthAdapter = {
  async getCurrentUser() { return (await accounts()).find((account) => account.user.id === localStorage.getItem(SESSION_KEY))?.user ?? null; },
  async signup(input) {
    const clean = { ...input, name: input.name.trim(), email: normalizeEmail(input.email) };
    validateSignup(clean);
    await accounts();
    const salt = crypto.randomUUID();
    const hash = await verifier(clean.password, salt);
    const all = readAccounts();
    if (all.some((account) => account.user.email === clean.email)) throw new Error("An account with that email already exists.");
    const user = { id: crypto.randomUUID(), name: clean.name, email: clean.email, createdAt: new Date().toISOString() };
    saveAccounts([...all, { user, salt, verifier: hash }]);
    localStorage.setItem(SESSION_KEY, user.id);
    return { user, requiresEmailConfirmation: false };
  },
  async login(input) {
    const email = normalizeEmail(input.email);
    validateEmail(email);
    const account = (await accounts()).find((item) => item.user.email === email);
    if (!account || await verifier(input.password, account.salt) !== account.verifier) throw new Error("Email or password is incorrect.");
    localStorage.setItem(SESSION_KEY, account.user.id);
    return account.user;
  },
  async logout() { localStorage.removeItem(SESSION_KEY); },
  async updateProfile(input) {
    const clean = { name: input.name.trim(), email: normalizeEmail(input.email) };
    validateProfile(clean);
    const all = await accounts();
    const account = all.find((item) => item.user.id === localStorage.getItem(SESSION_KEY));
    if (!account) throw new Error("Please log in again.");
    if (account.user.id === DEMO_ACCOUNT.id && clean.email !== DEMO_ACCOUNT.email) throw new Error("The shared demo email cannot be changed. Create your own demo account to try another email.");
    if (all.some((item) => item.user.id !== account.user.id && item.user.email === clean.email)) throw new Error("That email is already in use.");
    const user = { ...account.user, ...clean };
    saveAccounts(all.map((item) => item.user.id === user.id ? { ...item, user } : item));
    return { user, emailConfirmationRequired: false };
  },
  async forgotPassword(email) { validateEmail(normalizeEmail(email)); },
  async updatePassword(password) {
    validatePassword(password);
    const user = await mockAuthAdapter.getCurrentUser();
    if (!user) throw new Error("Please log in again.");
    if (user.id === DEMO_ACCOUNT.id) throw new Error("The shared demo password cannot be changed. Create your own demo account to try this.");
    const salt = crypto.randomUUID();
    const hash = await verifier(password, salt);
    saveAccounts(readAccounts().map((account) => account.user.id === user.id ? { ...account, salt, verifier: hash } : account));
  },
  subscribe(listener) {
    const refresh = (event: StorageEvent) => {
      if (event.key !== null && event.key !== AUTH_STORAGE_KEY && event.key !== SESSION_KEY) return;
      void mockAuthAdapter.getCurrentUser().then(listener).catch(() => {
        console.warn("Unable to refresh the demo session from browser storage.");
        listener(null);
      });
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  },
};
