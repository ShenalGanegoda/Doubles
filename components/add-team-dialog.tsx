"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, User } from 'lucide-react'

type FutsalPosition = "forward" | "midfield" | "defense"

interface TeamMember {
  id: string
  name: string
  score: number
  position?: FutsalPosition
}

interface Team {
  name: string
  members: TeamMember[]
}

interface AddTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTeam: (team: Team) => void
  editingTeam?: Team | null
}

export function AddTeamDialog({ open, onOpenChange, onAddTeam, editingTeam }: AddTeamDialogProps) {
  const [teamName, setTeamName] = useState("")
  const [members, setMembers] = useState<TeamMember[]>([])
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberScore, setNewMemberScore] = useState(5)
  const [newMemberPosition, setNewMemberPosition] = useState<FutsalPosition>("midfield")

  useEffect(() => {
    if (editingTeam && open) {
      setTeamName(editingTeam.name)
      setMembers([...editingTeam.members])
    } else if (!open) {
      // Reset form when dialog closes
      setTeamName("")
      setMembers([])
      setNewMemberName("")
      setNewMemberScore(5)
      setNewMemberPosition("midfield")
    }
  }, [editingTeam, open])

  const addMember = () => {
    if (newMemberName.trim()) {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: newMemberName.trim(),
        score: newMemberScore,
        position: newMemberPosition,
      }
      setMembers([...members, newMember])
      setNewMemberName("")
      setNewMemberScore(5)
      setNewMemberPosition("midfield")
    }
  }

  const removeMember = (id: string) => {
    setMembers(members.filter((member) => member.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (teamName.trim() && members.length >= 2) {
      onAddTeam({
        name: teamName.trim(),
        members,
      })
      // Reset form
      setTeamName("")
      setMembers([])
      setNewMemberName("")
      setNewMemberScore(5)
      setNewMemberPosition("midfield")
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    setTeamName("")
    setMembers([])
    setNewMemberName("")
    setNewMemberScore(5)
    setNewMemberPosition("midfield")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{editingTeam ? "Edit Team" : "Create New Team"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {editingTeam
              ? "Update team name and manage players"
              : "Add a team name and players with their skill scores (1-10)"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className="bg-gray-800/60 border-gray-700 text-white placeholder:text-gray-500"
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Add Players</Label>
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Player name"
                className="bg-gray-800/60 border-gray-700 text-white placeholder:text-gray-500 flex-1"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMember())}
              />
              <div className="flex items-center gap-2">
                <Label htmlFor="position" className="text-sm whitespace-nowrap">
                  Role:
                </Label>
                <select
                  id="position"
                  value={newMemberPosition}
                  onChange={(e) => setNewMemberPosition(e.target.value as FutsalPosition)}
                  className="bg-gray-800/60 border border-gray-700 text-white rounded-md px-2 py-2 text-sm"
                >
                  <option value="forward">Forward</option>
                  <option value="midfield">Midfield</option>
                  <option value="defense">Defense</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="score" className="text-sm whitespace-nowrap">
                  Score:
                </Label>
                <Input
                  id="score"
                  type="number"
                  min="1"
                  max="10"
                  value={newMemberScore}
                  onChange={(e) => setNewMemberScore(Number(e.target.value))}
                  className="bg-gray-800/60 border-gray-700 text-white w-16"
                />
              </div>
              <Button type="button" onClick={addMember} size="sm" className="bg-green-700 hover:bg-green-800">
                Add
              </Button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="space-y-2">
              <Label>Team Members ({members.length})</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {members.map((member) => (
                  <Card key={member.id} className="bg-gray-800/40 border-gray-700">
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-sm text-slate-400">
                            {member.position ? member.position.charAt(0).toUpperCase() + member.position.slice(1) : "Midfield"} • Skill: {member.score}/10
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose} className="text-gray-500 hover:text-white">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!teamName.trim() || members.length < 2}
              className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900"
            >
              {editingTeam ? "Update Team" : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
