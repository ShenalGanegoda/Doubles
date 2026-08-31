"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Trash2, Play, Edit } from "lucide-react"

type FutsalPosition = "forward" | "midfield" | "defense"

interface TeamMember {
  id: string
  name: string
  score: number
  position?: FutsalPosition
}

interface Team {
  id: string
  name: string
  members: TeamMember[]
  createdAt: string
}

interface TeamCardProps {
  team: Team
  onSelect: () => void
  onDelete: () => void
  onEdit: () => void
}

export function TeamCard({ team, onSelect, onDelete, onEdit }: TeamCardProps) {
  const averageScore = team.members.reduce((sum, member) => sum + member.score, 0) / team.members.length
  const createdDate = new Date(team.createdAt).toLocaleDateString()

  return (
    <Card className="bg-gray-900/60 border-gray-800 hover:bg-gray-900/80 transition-colors group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white text-lg">{team.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="w-3 h-3" />
              {createdDate}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-4 h-4" />
            <span className="text-sm">{team.members.length} players</span>
          </div>
          <Badge variant="secondary" className="bg-gray-800 text-gray-400">
            Avg: {averageScore.toFixed(1)}
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Players</p>
          <div className="flex flex-wrap gap-1">
            {team.members.slice(0, 3).map((member) => (
              <Badge key={member.id} variant="outline" className="text-xs border-gray-700 text-gray-400">
                {member.name} ({member.score})
              </Badge>
            ))}
            {team.members.length > 3 && (
              <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                +{team.members.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <Button
          onClick={onSelect}
          className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white"
          disabled={team.members.length < 2}
        >
          <Play className="w-4 h-4 mr-2" />
          Split Teams
        </Button>
      </CardContent>
    </Card>
  )
}
