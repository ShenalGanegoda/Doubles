"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from 'lucide-react'

type FutsalPosition = "forward" | "midfield" | "defense"

interface Team {
  id: string
  name: string
  members: { id: string; name: string; score: number; position?: FutsalPosition }[]
  createdAt: string
}

interface DeleteTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmDelete: () => void
  team: Team | null
}

export function DeleteTeamDialog({ open, onOpenChange, onConfirmDelete, team }: DeleteTeamDialogProps) {
  const handleDelete = () => {
    onConfirmDelete()
    onOpenChange(false)
  }

  if (!team) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">Delete Team</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-slate-400">
            Are you sure you want to delete "{team.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-medium mb-2">Team Details:</h4>
            <div className="space-y-1 text-sm text-slate-400">
              <p><span className="text-slate-300">Name:</span> {team.name}</p>
              <p><span className="text-slate-300">Players:</span> {team.members.length}</p>
              <p><span className="text-slate-300">Created:</span> {new Date(team.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-white hover:bg-gray-800/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
