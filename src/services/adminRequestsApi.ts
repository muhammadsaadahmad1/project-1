import { supabase } from "../lib/supabase";

export interface AdminRequest {
  id: string;
  email: string;
  phone: string;
  created_at: string;
}

function requireSupabase() {
  if (!supabase) throw new Error("Admin services are unavailable.");
  return supabase;
}

export async function listAdminRequests(): Promise<AdminRequest[]> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("list_admin_requests");
  if (error) throw error;
  return data || [];
}

export async function reviewAdminRequest(requestId: string, decision: "approved" | "rejected"): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.rpc("review_admin_request", {
    request_id: requestId,
    decision
  });
  if (error) throw error;
}