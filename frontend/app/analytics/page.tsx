"use client"

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Activity, ArrowDownRight, TrendingDown, DollarSign } from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/api/analytics/historical')
      .then(res => res.json())
      .then(json => {
        setData(json.data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch historical analytics", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-white p-8">Loading 30-Day Historical Data...</div>
  }

  // Calculate totals
  const totalBaseline = data.reduce((acc, curr) => acc + curr["Baseline Cost"], 0)
  const totalOptimized = data.reduce((acc, curr) => acc + curr["AI Optimized Cost"], 0)
  const totalSavings = totalBaseline - totalOptimized

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-20 print:bg-white print:text-black">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end print:hidden">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Historical Analytics</h1>
            <p className="text-gray-400">30-Day Financial Performance & Grid Compliance Reporting.</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center transition border border-gray-700"
          >
            Export PDF Report
          </button>
        </div>

        {/* Print-only Header (Hidden on screen) */}
        <div className="hidden print:block mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">VoltGrid AI: 30-Day Compliance & Savings Report</h1>
          <p className="text-gray-600">Generated automatically for Fleet Operations.</p>
        </div>

        {/* 30-Day KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111] border border-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">30-Day Baseline Cost</h3>
              <div className="p-2 bg-gray-800 rounded-lg"><DollarSign className="w-5 h-5 text-gray-400" /></div>
            </div>
            <p className="text-3xl font-bold text-white">₹ {totalBaseline.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Without AI Orchestration</p>
          </div>

          <div className="bg-[#111] border border-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">30-Day Optimized Cost</h3>
              <div className="p-2 bg-blue-500/20 rounded-lg"><Activity className="w-5 h-5 text-blue-400" /></div>
            </div>
            <p className="text-3xl font-bold text-blue-400">₹ {totalOptimized.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">With VoltGrid AI Orchestration</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-black border border-green-900/50 p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-400 font-medium">Total AI Savings</h3>
              <div className="p-2 bg-green-500/20 rounded-lg"><TrendingDown className="w-5 h-5 text-green-400" /></div>
            </div>
            <p className="text-4xl font-bold text-green-400">₹ {totalSavings.toLocaleString()}</p>
            <div className="mt-2 flex items-center text-sm font-bold text-green-500">
              <ArrowDownRight className="w-4 h-4 mr-1" /> 18% Reduction
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl shadow-lg shadow-black/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">30-Day Cost Arbitrage Comparison</h2>
            <p className="text-sm text-gray-500 mt-1">Daily energy costs with vs. without AI load shifting.</p>
          </div>
          
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                  cursor={{fill: '#222'}}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Baseline Cost" fill="#4b5563" radius={[4, 4, 0, 0]} />
                <Bar dataKey="AI Optimized Cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </main>
  )
}
