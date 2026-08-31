// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetch all teams with members for a given user email
export async function fetchTeams(userEmail: string) {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name, created_at, user_email")

    if (error) throw error

    const filteredTeams = (data ?? []).filter((team: any) => {
      if (team.user_email === undefined || team.user_email === null) return true
      return team.user_email === userEmail
    })

    const teamIds = filteredTeams.map((team: any) => team.id)

    let members: any[] = []
    if (teamIds.length > 0) {
      const { data: membersData, error: membersError } = await supabase
        .from("team_members")
        .select("id, name, score, position, team_id")
        .in("team_id", teamIds)

      if (membersError) {
        const fallback = await supabase
          .from("team_members")
          .select("id, name, score, team_id")
          .in("team_id", teamIds)

        members = fallback.data ?? []
      } else {
        members = membersData ?? []
      }
    }

    const groupedMembers = members.reduce((acc: Record<string, any[]>, member: any) => {
      if (!acc[member.team_id]) acc[member.team_id] = []
      acc[member.team_id].push({
        id: member.id,
        name: member.name,
        score: member.score,
        position: member.position ?? "midfield",
      })
      return acc
    }, {})

    return filteredTeams.map((team: any) => ({
      id: team.id,
      name: team.name,
      createdAt: team.created_at,
      members: groupedMembers[team.id] ?? [],
    }))
  } catch (error: any) {
    console.error("Supabase fetch error:", error?.message ?? error)
    return []
  }
}
