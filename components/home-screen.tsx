"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, LogOut } from "lucide-react";
import { AddTeamDialog } from "./add-team-dialog";
import { TeamCard } from "./team-card";
import { TeamSplitter } from "./team-splitter";
import { DeleteTeamDialog } from "./delete-team-dialog";
import { Footer } from "./footer";

interface User {
  email: string;
  name: string;
}

interface TeamMember {
  id: string;
  name: string;
  score: number;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  createdAt: string;
}

interface HomeScreenProps {
  user: User;
  onLogout: () => void;
}

export function HomeScreen({ user, onLogout }: HomeScreenProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  useEffect(() => {
    // Load teams from localStorage
    const savedTeams = localStorage.getItem("doublesTeams");
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
  }, []);

  const saveTeams = (newTeams: Team[]) => {
    setTeams(newTeams);
    localStorage.setItem("doublesTeams", JSON.stringify(newTeams));
  };

  const addTeam = (team: Omit<Team, "id" | "createdAt">) => {
    const newTeam: Team = {
      ...team,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedTeams = [...teams, newTeam];
    saveTeams(updatedTeams);
  };

  const handleDeleteTeam = (team: Team) => {
    setDeletingTeam(team);
  };

  const confirmDeleteTeam = () => {
    if (deletingTeam) {
      const updatedTeams = teams.filter((team) => team.id !== deletingTeam.id);
      saveTeams(updatedTeams);
      if (selectedTeam?.id === deletingTeam.id) {
        setSelectedTeam(null);
      }
      setDeletingTeam(null);
    }
  };

  const updateTeam = (updatedTeam: Omit<Team, "id" | "createdAt">) => {
    if (editingTeam) {
      const updated: Team = {
        ...editingTeam,
        ...updatedTeam,
      };
      const updatedTeams = teams.map((team) =>
        team.id === editingTeam.id ? updated : team
      );
      saveTeams(updatedTeams);
      setEditingTeam(null);
    }
  };

  if (selectedTeam) {
    return (
      <TeamSplitter
        team={selectedTeam}
        onBack={() => setSelectedTeam(null)}
        user={user}
        onEditTeam={() => {
          setEditingTeam(selectedTeam);
          setSelectedTeam(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900 relative overflow-hidden flex flex-col">
      {/* Grainy texture overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]"></div>

      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-800/50 bg-gray-900/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Doubles</h1>
                <p className="text-sm text-slate-400">
                  Welcome back, {user.name}!
                </p>
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

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Your Teams</h2>
            <p className="text-slate-400">
              Create and manage your Futsal teams
            </p>
          </div>

          {/* Teams Grid */}
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
                <h3 className="text-lg font-semibold text-white mb-2">
                  Add New Team
                </h3>
                <p className="text-slate-400 text-center text-sm">
                  Create a team and add players
                </p>
              </CardContent>
            </Card>

            {/* Team Cards */}
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

          {teams.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No teams yet
              </h3>
              <p className="text-slate-400 mb-6">
                Get started by creating your first team
              </p>
              <Button
                onClick={() => setShowAddTeam(true)}
                className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>
          )}
        </main>
      </div>

      <AddTeamDialog
        open={showAddTeam}
        onOpenChange={setShowAddTeam}
        onAddTeam={addTeam}
      />

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
  );
}

export default HomeScreen;
