import type { User } from "../types/models";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export interface UserProfile extends User {}

function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  return supabase;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const client = requireSupabase();
  const { data, error } = await client.from("profiles").select("id, email, display_name, phone, address, is_admin").eq("id", userId).single();
  if (error) throw error;
  return {
    id: data.id,
    displayName: data.display_name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    isAdmin: data.is_admin,
    isGuest: false
  };
}

export async function signInUser(email: string, password: string): Promise<UserProfile> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error("Unable to sign in.");
  return fetchUserProfile(data.user.id);
}

export async function signInAdmin(email: string, password: string): Promise<UserProfile> {
  const profile = await signInUser(email, password);
  if (!profile.isAdmin) {
    await supabase?.auth.signOut();
    throw new Error("This account does not have administrator access.");
  }
  return profile;
}

export async function registerUser(name: string, email: string, password: string): Promise<UserProfile> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { display_name: name } }
  });
  if (error) throw error;
  if (!data.user) throw new Error("Account creation did not return a user.");
  if (!data.session) throw new Error("Check your email to confirm your account, then sign in.");
  return fetchUserProfile(data.user.id);
}

export async function updateUserProfile(userId: string, profile: Pick<User, "displayName" | "phone" | "address">): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("profiles").update({
    display_name: profile.displayName,
    phone: profile.phone || "",
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
