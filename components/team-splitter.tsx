"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shuffle, Users, Trophy, Edit } from "lucide-react"
import { Footer } from "./footer"

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

interface User {
  email: string
  name: string
}

interface TeamSplitterProps {
  team: Team
  onBack: () => void
  user: User
  onEditTeam: () => void
}

interface SplitTeams {
  team1: TeamMember[]
  team2: TeamMember[]
  team1Score: number
  team2Score: number
}

export function TeamSplitter({ team, onBack, user, onEditTeam }: TeamSplitterProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>(team.members.map((m) => m.id))
  const [splitTeams, setSplitTeams] = useState<SplitTeams | null>(null)

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  const generateTeams = () => {
    const selected = team.members
      .filter((member) => selectedMembers.includes(member.id))
      .sort((a, b) => {
        const positionOrder: FutsalPosition[] = ["forward", "midfield", "defense"]
        return b.score - a.score || positionOrder.indexOf(a.position ?? "midfield") - positionOrder.indexOf(b.position ?? "midfield")
      })

    if (selected.length < 2) return

    const getPosition = (member: TeamMember) => member.position ?? "midfield"
    const roleOrder: FutsalPosition[] = ["forward", "midfield", "defense"]

    const getRoleCount = (members: TeamMember[], position: FutsalPosition) =>
      members.filter((member) => getPosition(member) === position).length

    const getScore = (members: TeamMember[]) =>
      members.reduce((total, member) => total + member.score, 0)

    const getPenalty = (team1: TeamMember[], team2: TeamMember[]) => {
      const scoreGap = Math.abs(getScore(team1) - getScore(team2))
      const sizeGap = Math.abs(team1.length - team2.length)
      const roleGap = roleOrder.reduce(
        (total, position) => total + Math.abs(getRoleCount(team1, position) - getRoleCount(team2, position)),
        0,
      )

      return scoreGap * 12 + roleGap * 18 + sizeGap * 4
    }

    let bestSplit: SplitTeams | null = null
    let bestPenalty = Number.POSITIVE_INFINITY

    for (let mask = 1; mask < (1 << selected.length) - 1; mask++) {
      const team1: TeamMember[] = []
      const team2: TeamMember[] = []

      selected.forEach((player, index) => {
        if ((mask >> index) & 1) {
          team1.push(player)
        } else {
          team2.push(player)
        }
      })

      if (team1.length === 0 || team2.length === 0) continue

      const penalty = getPenalty(team1, team2)
      if (penalty < bestPenalty) {
        bestPenalty = penalty
        bestSplit = {
          team1,
          team2,
          team1Score: getScore(team1),
          team2Score: getScore(team2),
        }
      }
    }

    if (bestSplit) {
      setSplitTeams(bestSplit)
      return
    }

    const team1: TeamMember[] = []
    const team2: TeamMember[] = []
    let team1Score = 0
    let team2Score = 0

    selected.forEach((player) => {
      const playerPosition = getPosition(player)
      const team1RoleCount = getRoleCount(team1, playerPosition)
      const team2RoleCount = getRoleCount(team2, playerPosition)
      const nextTeam1Score = team1Score + player.score
      const nextTeam2Score = team2Score + player.score

      const chooseTeam1 =
        (team1RoleCount <= team2RoleCount && Math.abs(nextTeam1Score - team2Score) <= Math.abs(nextTeam2Score - team1Score)) ||
        (team1RoleCount < team2RoleCount && Math.abs(nextTeam1Score - team2Score) < Math.abs(nextTeam2Score - team1Score))

      if (chooseTeam1) {
        team1.push(player)
        team1Score = nextTeam1Score
      } else {
        team2.push(player)
        team2Score = nextTeam2Score
      }
    })

    setSplitTeams({
      team1,
      team2,
      team1Score,
      team2Score,
    })
  }

  const resetSplit = () => {
    setSplitTeams(null)
  }

  const formatPosition = (position?: FutsalPosition) => {
    if (!position) return "Midfield"
    return position.charAt(0).toUpperCase() + position.slice(1)
  }

  const selectedCount = selectedMembers.length
  const canGenerate = selectedCount >= 2

  return (
    <div className="min-h-screen bg-gray-900 relative flex flex-col">
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800/50 bg-gray-900/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-gray-500 hover:text-white hover:bg-gray-800/50"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{team.name}</h1>
                <p className="text-sm text-slate-400">Split into balanced teams</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditTeam}
              className="text-gray-500 hover:text-blue-400 hover:bg-blue-500/10"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Team
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {!splitTeams ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="bg-gray-900/60 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Select Players
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Choose which players to include in the team split ({selectedCount} selected)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/40 border border-gray-700"
                      >
                        <Checkbox
                          id={member.id}
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={() => toggleMember(member.id)}
                          className="border-gray-600 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700"
                        />
                        <div className="flex-1">
                          <label htmlFor={member.id} className="text-white font-medium cursor-pointer">
                            {member.name}
                          </label>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary" className="bg-gray-700 text-gray-400 text-xs">
                              {formatPosition(member.position)}
                            </Badge>
                            <Badge variant="secondary" className="bg-gray-700 text-gray-400 text-xs">
                              Score: {member.score}/10
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button
                  onClick={generateTeams}
                  disabled={!canGenerate}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white px-8"
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  Generate Balanced Teams
                </Button>
                {!canGenerate && (
                  <p className="text-slate-400 text-sm mt-2">Select at least 2 players to generate teams</p>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Teams Generated!</h2>
                <p className="text-slate-400">Here are your balanced teams</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team 1 */}
                <Card className="bg-gradient-to-br from-slate-900/60 to-gray-900/60 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-blue-400" />
                        Team 01
                      </div>
                      <Badge className="bg-slate-700 text-white">Total: {splitTeams.team1Score}</Badge>
                    </CardTitle>
                    <CardDescription className="text-blue-200">
                      {splitTeams.team1.length} players • Avg:{" "}
                      {(splitTeams.team1Score / splitTeams.team1.length).toFixed(1)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {splitTeams.team1.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/40"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-white font-medium">{member.name}</span>
                            <Badge variant="secondary" className="bg-slate-800 text-slate-200 text-[10px] uppercase">
                              {formatPosition(member.position)}
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                            {member.score}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Team 2 */}
                <Card className="bg-gradient-to-br from-red-950/60 to-gray-900/60 border-red-900/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-red-400" />
                        Team 02
                      </div>
                      <Badge className="bg-red-800 text-white">Total: {splitTeams.team2Score}</Badge>
                    </CardTitle>
                    <CardDescription className="text-red-200">
                      {splitTeams.team2.length} players • Avg:{" "}
                      {(splitTeams.team2Score / splitTeams.team2.length).toFixed(1)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {splitTeams.team2.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg border border-red-800/30"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-white font-medium">{member.name}</span>
                            <Badge variant="secondary" className="bg-red-900 text-red-200 text-[10px] uppercase">
                              {formatPosition(member.position)}
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="bg-red-900 text-red-200">
                            {member.score}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center space-x-4">
                <Button
                  onClick={resetSplit}
                  variant="outline"
                  className="border-gray-700 text-gray-400 hover:bg-gray-800/50 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Selection
                </Button>
                <Button
                  onClick={generateTeams}
                  className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Shuffle Again
                </Button>
              </div>

              {/* Balance Info */}
              <Card className="bg-gray-900/40 border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">
                      Score difference: {Math.abs(splitTeams.team1Score - splitTeams.team2Score)} points
                    </p>
                    <div className="mt-2 text-xs text-gray-600">Teams are balanced using both player role and total skill scores</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
