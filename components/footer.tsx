"use client"

import { Users } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-800/50 bg-gray-900/40 backdrop-blur-sm mt-auto opacity-30">
      <div className="container mx-auto px-4 py-2 font-normal opacity-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left aligned - Terms and Privacy */}
          <div className="flex items-center gap-4 text-sm text-slate-400 order-3 md:order-1">
            <a href="#" className="hover:text-white transition-colors">
              Terms of use
            </a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
          </div>

          {/* Center aligned - Logo + Powered by */}
          <div className="flex items-center gap-3 order-1 md:order-2">
            
            <span className="text-slate-400 text-sm">Powered by Moai Technology</span>
          </div>

          {/* Right aligned - Copyright */}
          <div className="text-sm text-slate-400 order-2 md:order-3">
            ©2025 Double
          </div>
        </div>
      </div>
    </footer>
  )
}
