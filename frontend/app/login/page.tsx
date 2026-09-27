"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@tenant-a.voltgrid.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      // Mock login authentication delay
      setLoading(false)
      router.push('/')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-6 relative overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-900/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="z-10 w-full max-w-md bg-[#111] border border-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-green-500/20 p-4 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <Zap className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-2">VoltGrid</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">Enterprise Multi-Tenant Authentication</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Work Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold flex justify-center items-center transition shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            {loading ? "Authenticating SSO..." : <><ShieldCheck className="w-5 h-5 mr-2"/> Secure Sign In</>}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-600">
          <p>SSO Provided by Okta. Protected by ISO 27001.</p>
        </div>
      </div>
    </div>
  )
}
