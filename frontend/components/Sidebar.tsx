"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BatteryCharging, IndianRupee, Settings, Zap, Activity } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { name: 'Overview', href: '/', icon: Home },
    { name: 'Fleet Status', href: '/fleet', icon: BatteryCharging },
    { name: 'Tariffs & Billing', href: '/billing', icon: IndianRupee },
    { name: 'Historical Analytics', href: '/analytics', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="w-64 h-screen bg-[#0a0a0a] border-r border-gray-800 flex flex-col fixed left-0 top-0 print:hidden">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-green-500/20 p-2 rounded-lg">
          <Zap className="w-6 h-6 text-green-400" />
        </div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">VoltGrid</h2>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-8">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link key={link.name} href={link.href} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              isActive 
                ? 'text-white bg-gray-800/50 border border-gray-700/50' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
              <span className="font-medium">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
          <div>
            <p className="text-sm font-medium text-white">Demo Fleet Ops</p>
            <p className="text-xs text-gray-500">tenant-a.voltgrid.com</p>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/login" className="text-xs text-gray-500 hover:text-white transition flex items-center">
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  )
}
