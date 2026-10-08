import type { User } from "../types/models";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export interface UserProfile extends User {}
export type ContactType = "email" | "phone";
export type VerificationType = "email" | "sms" | "email_change" | "phone_change";

function requireSupabase() {
  if (!supabase) throw new Error("Sign-in is unavailable. Check the Supabase setup.");
  return supabase;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const client = requireSupabase();
  const { data, error } = await client.from("profiles")
    .select("id, email, display_name, phone, address, role, email_verified, phone_verified")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return {
    id: data.id,
    displayName: data.display_name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    role: data.role,
    emailVerified: data.email_verified,
    phoneVerified: data.phone_verified
  };
}

export async function signInUser(identifier: string, password: string): Promise<UserProfile> {
  const client = requireSupabase();
  const credentials = identifier.includes("@")
    ? { email: identifier, password }
    : { phone: identifier, password };
  const { data, error } = await client.auth.signInWithPassword(credentials);
  if (error) throw error;
  if (!data.user) throw new Error("Invalid sign-in details.");
  return fetchUserProfile(data.user.id);
}

export async function signInAdmin(identifier: string, password: string): Promise<UserProfile> {
  const client = requireSupabase();
  const profile = await signInUser(identifier, password);
  const { data, error } = await client.rpc("is_current_user_admin");
  if (error || data !== true) {
    await client.auth.signOut();
    throw new Error("Invalid credentials or access denied.");
  }
  return profile;
}

export async function verifyCurrentAdmin(): Promise<boolean> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("is_current_user_admin");
  return !error && data === true;
}

export async function registerUser(email: string, password: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error("Unable to create your account.");
  return {
    profile: data.session ? await fetchUserProfile(data.user.id) : null,
    confirmationRequired: !data.session
  };
}

export async function requestContactVerification(type: ContactType, value: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.updateUser(type === "email" ? { email: value } : { phone: value });
  if (error) throw error;
}

export async function resendVerificationCode(
  type: ContactType,
  value: string,
  isNewContact: boolean
): Promise<void> {
  if (isNewContact) {
    await requestContactVerification(type, value);
    return;
  }
  const client = requireSupabase();
  const { error } = await client.auth.resend(type === "email"
    ? { type: "signup", email: value }
    : { type: "sms", phone: value });
  if (error) throw error;
}

export async function verifyAuthOtp(
  type: ContactType,
  value: string,
  token: string,
  verificationType?: VerificationType
): Promise<void> {
  const client = requireSupabase();
  const otpType = verificationType || (type === "email" ? "email" : "sms");
  const { error } = type === "email"
    ? await client.auth.verifyOtp({ email: value, token, type: otpType })
    : await client.auth.verifyOtp({ phone: value, token, type: otpType });
  if (error) throw error;
}

export async function updateUserProfile(
  userId: string,
  profile: Pick<User, "displayName" | "address">
): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("profiles").update({
    display_name: profile.displayName,
    address: profile.address || ""
  }).eq("id", userId);
  if (error) throw error;
}

export async function signOutUser(): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export { isSupabaseConfigured };
