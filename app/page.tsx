"use client"

import React, { useState, useEffect } from "react"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Mail, Lock } from 'lucide-react'
import HomeScreen from "@/components/HomeScreen"
import { supabase } from "@/lib/supabaseClient"

interface User {
  email: string
  name: string
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false) 

  useEffect(() => {
    const savedUser = localStorage.getItem("doublesUser")
    if (savedUser) setUser(JSON.parse(savedUser))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (isSignUp) {
      // Sign Up
      if (password !== confirmPassword) {
        alert("Passwords do not match")
        setIsLoading(false)
        return
      }

      const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase())

      const { error } = await supabase
        .from("users")
        .insert([{ email, name, password }])

      if (error) {
        alert("Sign Up Error: " + error.message)
        setIsLoading(false)
        return
      }

      const userData: User = { email, name }
      localStorage.setItem("doublesUser", JSON.stringify(userData))
      setUser(userData)
    } else {
      // Sign In
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single()

      if (error || !data) {
        alert("Invalid email or password")
        setIsLoading(false)
        return
      }

      const userData: User = { email: data.email, name: data.name }
      localStorage.setItem("doublesUser", JSON.stringify(userData))
      setUser(userData)
    }

    setIsLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("doublesUser")
    localStorage.removeItem("doublesTeams")
    setUser(null)
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setIsSignUp(false) // ensure it goes to Sign In mode
  }


  if (user) return <HomeScreen user={user} onLogout={handleLogout} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900 flex flex-col relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900/90 backdrop-blur-sm border-gray-800 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                {isSignUp ? "Sign Up" : "Sign In"}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {isSignUp ? "Create a new account" : "Sign in to your account"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-600"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-600"
                    required
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-600"
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (isSignUp ? "Signing up..." : "Signing in...") : (isSignUp ? "Sign Up" : "Sign In")}
              </Button>
            </form>

            <p className="text-center text-slate-400 mt-4">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-green-500 font-semibold hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}