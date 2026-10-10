import { isSupabaseConfigured, supabase } from "../lib/supabase";

export interface AdminProfile {
  id: string;
  email: string;
  displayName: string;
  role: "admin";
}

function requireSupabase() {
  if (!supabase) throw new Error("Admin sign-in is unavailable. Check the Supabase setup.");
  return supabase;
}

export async function fetchAdminProfile(userId: string): Promise<AdminProfile> {
  const client = requireSupabase();
  const { data, error } = await client.from("profiles")
    .select("id, email, display_name, role")
    .eq("id", userId)
    .single();
  if (error) throw error;
  if (data.role !== "admin") throw new Error("Admin access required.");
  return {
    id: data.id,
    displayName: data.display_name,
    email: data.email,
    role: "admin"
  };
}

export async function signInAdmin(identifier: string, password: string): Promise<AdminProfile> {
  const client = requireSupabase();
  const credentials = identifier.includes("@")
    ? { email: identifier, password }
    : { phone: identifier, password };
  const { data: authData, error: authError } = await client.auth.signInWithPassword(credentials);
  if (authError) throw authError;
  if (!authData.user) throw new Error("Invalid sign-in details.");
  const { data, error } = await client.rpc("is_current_user_admin");
  if (error || data !== true) {
    await client.auth.signOut();
    throw new Error("Invalid credentials or access denied.");
  }
  return fetchAdminProfile(authData.user.id);
}

export async function verifyCurrentAdmin(): Promise<boolean> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("is_current_user_admin");
  return !error && data === true;
}

export async function signOutAdmin(): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export { isSupabaseConfigured };
