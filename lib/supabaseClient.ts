// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetch all teams with members for a given user email
export async function fetchTeams(userEmail: string) {
  const { data, error } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      created_at,
      team_members (
        id,
        name,
        score
      )
    `)
    .eq("user_email", userEmail); // updated to match column name

  if (error) {
    console.error("Supabase fetch error:", error.message);
    return [];
  }

  // Convert to your local Team type
  return (data ?? []).map((team: any) => ({
    id: team.id,
    name: team.name,
    createdAt: team.created_at,
    members: team.team_members || [],
  }));
}
