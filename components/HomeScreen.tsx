"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Users, LogOut } from "lucide-react"
import { AddTeamDialog } from "./add-team-dialog"
import { TeamCard } from "./team-card"
import { TeamSplitter } from "./team-splitter"
import { DeleteTeamDialog } from "./delete-team-dialog"
import { Footer } from "./footer"
import { supabase } from "@/lib/supabaseClient"

interface User {
  email: string
  name: string
}

interface TeamMember {
  id: string
  name: string
  score: number
}

interface Team {
  id: string
  name: string
  members: TeamMember[]
  createdAt: string
}

interface HomeScreenProps {
  user: User
  onLogout: () => void
}

export function HomeScreen({ user, onLogout }: HomeScreenProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)

  // Ensure user exists in users table
  const upsertUser = async () => {
    const { error } = await supabase
      .from("users")
      .upsert({ email: user.email, name: user.name })
    if (error) console.error("Error upserting user:", error)
  }

  // Fetch teams with members
  const fetchTeams = async () => {
    await upsertUser() // ensure user exists first

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
      .eq("user_email", user.email)

    if (error) {
      console.error("Error fetching teams:", error)
      return
    }

    const sanitizedTeams: Team[] = data.map((team: any) => ({
      id: team.id,
      name: team.name,
      createdAt: team.created_at,
      members: team.team_members || [],
    }))

    setTeams(sanitizedTeams)
  }

  useEffect(() => {
    fetchTeams()
  }, [user])

  // Add new team
  const addTeam = async (team: Omit<Team, "id" | "createdAt">) => {
  try {
    // 1️⃣ Insert the team
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert([{ name: team.name, user_email: user.email }])
      .select()
      .single()

    if (teamError) throw teamError

    const teamId = teamData.id

    // 2️⃣ Insert team members if any
    if (team.members.length > 0) {
      const membersToInsert = team.members.map((m) => ({
        name: m.name,
        score: m.score,
        team_id: teamId,
      }))

      const { error: membersError } = await supabase
        .from("team_members")
        .insert(membersToInsert)

      if (membersError) throw membersError
    }

    // 3️⃣ Update local state
    const newTeam: Team = {
      id: teamId,
      name: team.name,
      createdAt: teamData.created_at,
      members: team.members,
    }

    setTeams((prev) => [...prev, newTeam])
    setShowAddTeam(false)
  } catch (err) {
    console.error("Error adding team:", err)
  }
}


  // Update team
  const updateTeam = async (updatedTeam: Omit<Team, "id" | "createdAt"> & { members: TeamMember[] }) => {
  if (!editingTeam) return

  try {
    // 1️⃣ Update team name
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .update({ name: updatedTeam.name })
      .eq("id", editingTeam.id)
      .select()
      .single()
    if (teamError) throw teamError

    const teamId = editingTeam.id

    // 2️⃣ Handle team members
    const existingMemberIds = editingTeam.members.map((m) => m.id)
    const updatedMemberIds = updatedTeam.members.map((m) => m.id).filter(Boolean)

    // a) Delete removed members
    const membersToDelete = existingMemberIds.filter((id) => !updatedMemberIds.includes(id))
    if (membersToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("team_members")
        .delete()
        .in("id", membersToDelete)
      if (deleteError) throw deleteError
    }

    // b) Update existing members
    for (const member of updatedTeam.members) {
      if (member.id && existingMemberIds.includes(member.id)) {
        const { error: updateError } = await supabase
          .from("team_members")
          .update({ name: member.name, score: member.score })
          .eq("id", member.id)
        if (updateError) throw updateError
      }
    }

    // c) Insert new members 
    const newMembers = updatedTeam.members.filter(
      (m) => !m.id || !existingMemberIds.includes(m.id) // not in DB
    )

    if (newMembers.length > 0) {
      const { data: insertedMembers, error: insertError } = await supabase
        .from("team_members")
        .insert(
          newMembers.map((m) => ({
            name: m.name,
            score: m.score,
            team_id: teamId,
          }))
        )
        .select()

      if (insertError) {
        console.error("Insert Error:", insertError)
        throw insertError
      }

      console.log("Inserted Members:", insertedMembers)

      // Merge inserted IDs back into state
      updatedTeam.members = updatedTeam.members.map((m) => {
        const dbMatch = insertedMembers.find((im) => im.name === m.name && im.score === m.score)
        return dbMatch ? dbMatch : m
      })
    }

    // 3️⃣ Update local state
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, name: updatedTeam.name, members: updatedTeam.members } : t
      )
    )
    setEditingTeam(null)
  } catch (err) {
    console.error("Error updating team:", err)
  }
}

  // Prepare to delete team
  const handleDeleteTeam = (team: Team) => setDeletingTeam(team)

  // Confirm delete
  const confirmDeleteTeam = async () => {
    if (!deletingTeam) return
    try {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", deletingTeam.id)

      if (error) throw error

      setTeams((prev) => prev.filter((t) => t.id !== deletingTeam.id))
      if (selectedTeam?.id === deletingTeam.id) setSelectedTeam(null)
      setDeletingTeam(null)
    } catch (err) {
      console.error("Error deleting team:", err)
    }
  }

  if (selectedTeam) {
    return (
      <TeamSplitter
        team={selectedTeam}
        onBack={() => setSelectedTeam(null)}
        user={user}
        onEditTeam={() => {
          setEditingTeam(selectedTeam)
          setSelectedTeam(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900 relative overflow-hidden flex flex-col">
      {/* Header & main content */}
      <header className="border-b border-gray-800/50 bg-gray-900/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Doubles</h1>
              <p className="text-sm text-slate-400">Welcome back, {user.name}!</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-gray-500 hover:text-white hover:bg-gray-800/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Teams grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Add Team Card */}
          <Card
            className="bg-gray-900/60 border-gray-800 border-dashed cursor-pointer hover:bg-gray-900/80 transition-colors group"
            onClick={() => setShowAddTeam(true)}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-800/60 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-700/30 transition-colors">
                <Plus className="w-8 h-8 text-gray-500 group-hover:text-green-500 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Add New Team</h3>
              <p className="text-slate-400 text-center text-sm">Create a team and add players</p>
            </CardContent>
          </Card>

          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onSelect={() => setSelectedTeam(team)}
              onDelete={() => handleDeleteTeam(team)}
              onEdit={() => setEditingTeam(team)}
            />
          ))}
        </div>
      </main>

      {/* Dialogs */}
      <AddTeamDialog open={showAddTeam} onOpenChange={setShowAddTeam} onAddTeam={addTeam} />
      <AddTeamDialog
        open={!!editingTeam}
        onOpenChange={(open) => !open && setEditingTeam(null)}
        onAddTeam={updateTeam}
        editingTeam={editingTeam}
      />
      <DeleteTeamDialog
        open={!!deletingTeam}
        onOpenChange={(open) => !open && setDeletingTeam(null)}
        onConfirmDelete={confirmDeleteTeam}
        team={deletingTeam}
      />

      <Footer />
    </div>
  )
}

export default HomeScreen