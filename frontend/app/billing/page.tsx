"use client"

import { useState, useEffect } from 'react'
import { IndianRupee, TrendingDown, Sun, Moon, Zap, Download } from 'lucide-react'

export default function BillingPage() {
  const [baseRate, setBaseRate] = useState<number>(8.00)
  const [stateName, setStateName] = useState<string>('Tamil Nadu (Default)')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Read the user's selected state and rate from localStorage
    const savedRate = localStorage.getItem('voltgrid_state_rate')
    const savedName = localStorage.getItem('voltgrid_state_name')
    
    if (savedRate && savedName) {
      setBaseRate(parseFloat(savedRate))
      setStateName(savedName)
    }
    setIsLoaded(true)
  }, [])

  // Ministry of Power Official ToD Multipliers
  const solarMultiplier = 0.8
  const peakMultiplier = 1.2

  const solarRate = baseRate * solarMultiplier
  const peakRate = baseRate * peakMultiplier

  // Dynamically calculate history table based on the selected baseRate
  // We assume the AI successfully shifted 85% of charging to solar hours, 15% to base, and 0% to peak.
  const generateHistory = () => {
    const months = [
      { name: 'May 2026', kwh: 42500 },
      { name: 'Apr 2026', kwh: 41200 },
      { name: 'Mar 2026', kwh: 39800 },
      { name: 'Feb 2026', kwh: 38500 },
    ]

    return months.map(m => {
      const baselineCost = m.kwh * baseRate
      // AI Cost = (85% * solarRate) + (15% * baseRate)
      const aiCost = m.kwh * (0.85 * solarRate + 0.15 * baseRate)
      const savings = baselineCost - aiCost

      return {
        month: m.name,
        totalKw: m.kwh.toLocaleString(),
        baseline: `₹ ${baselineCost.toLocaleString(undefined, {maximumFractionDigits:0})}`,
        actual: `₹ ${aiCost.toLocaleString(undefined, {maximumFractionDigits:0})}`,
        savings: `₹ ${savings.toLocaleString(undefined, {maximumFractionDigits:0})}`,
        rawSavings: savings
      }
    })
  }

  const billingHistory = generateHistory()
  const ytdSavings = billingHistory.reduce((acc, curr) => acc + curr.rawSavings, 0)

  // Avoid hydration mismatch flash by not rendering until loaded
  if (!isLoaded) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Tariff Mathematics...</div>

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Tariffs & Billing</h1>
          <p className="text-gray-400">Time-of-Day (ToD) tariff agreements and AI-optimized billing history for <span className="font-bold text-white">{stateName}</span>.</p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111] border border-gray-800 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <IndianRupee className="w-24 h-24" />
            </div>
            <p className="text-gray-400 font-medium text-sm mb-2">YTD AI Savings</p>
            <h2 className="text-4xl font-bold text-green-400 mb-2">₹ {ytdSavings.toLocaleString(undefined, {maximumFractionDigits:0})}</h2>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingDown className="w-4 h-4 mr-1 text-green-400" />
              <span>18.5% reduction vs baseline</span>
            </div>
          </div>

          <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
            <p className="text-gray-400 font-medium text-sm mb-2">Current Billing Cycle (June)</p>
            <h2 className="text-4xl font-bold text-white mb-2">₹ {(ytdSavings * 0.45).toLocaleString(undefined, {maximumFractionDigits:0})}</h2>
            <div className="w-full bg-gray-800 rounded-full h-2 mt-4 mb-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-xs text-gray-500">14 days remaining in billing cycle</p>
          </div>

          <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
            <p className="text-gray-400 font-medium text-sm mb-2">Active Tariff Profile</p>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <Sun className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">NITI Aayog ToD ({stateName})</h3>
                <p className="text-xs text-gray-400">Base Rate: ₹{baseRate.toFixed(2)}/kWh</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-md border border-green-500/20 font-medium">Solar: -20%</span>
              <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-md border border-red-500/20 font-medium">Peak: +20%</span>
            </div>
          </div>
        </div>

        {/* ToD Visualizer */}
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-400" /> Time-of-Day (ToD) Tariff Structure
            </h3>
            <span className="text-sm font-medium text-gray-400">Baseline: ₹{baseRate.toFixed(2)} / kWh</span>
          </div>
          
          <div className="relative h-24 w-full bg-gray-900 rounded-lg overflow-hidden flex border border-gray-800">
            {/* Night - Standard */}
            <div className="flex-1 flex flex-col justify-center items-center border-r border-gray-800 relative group">
              <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-blue-900/20 transition"></div>
              <Moon className="w-5 h-5 text-gray-500 mb-1" />
              <span className="text-xs font-bold text-gray-400">00:00 - 10:00</span>
              <span className="text-sm font-medium text-white mt-1">₹{baseRate.toFixed(2)} Base</span>
            </div>
            
            {/* Solar - Discounted */}
            <div className="flex-1 flex flex-col justify-center items-center border-r border-gray-800 relative group bg-green-900/10">
              <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition"></div>
              <div className="absolute top-0 w-full h-1 bg-green-500"></div>
              <Sun className="w-5 h-5 text-yellow-500 mb-1" />
              <span className="text-xs font-bold text-green-400">10:00 - 16:00</span>
              <span className="text-sm font-bold text-green-400 mt-1">₹{solarRate.toFixed(2)} / kWh (-20%)</span>
            </div>

            {/* Standard Transition */}
            <div className="flex-[0.5] flex flex-col justify-center items-center border-r border-gray-800 relative group">
               <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-blue-900/20 transition"></div>
              <span className="text-xs font-bold text-gray-400">16:00 - 18:00</span>
              <span className="text-sm font-medium text-white mt-1">Base</span>
            </div>

            {/* Peak - Penalty */}
            <div className="flex-1 flex flex-col justify-center items-center relative group bg-red-900/10">
              <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition"></div>
              <div className="absolute top-0 w-full h-1 bg-red-500"></div>
              <TrendingDown className="w-5 h-5 text-red-500 mb-1 rotate-180" />
              <span className="text-xs font-bold text-red-400">18:00 - 22:00</span>
              <span className="text-sm font-bold text-red-400 mt-1">₹{peakRate.toFixed(2)} / kWh (+20%)</span>
            </div>

             {/* Night - Standard */}
             <div className="flex-[0.5] flex flex-col justify-center items-center border-l border-gray-800 relative group">
              <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-blue-900/20 transition"></div>
              <span className="text-xs font-bold text-gray-400">22:00 - 24:00</span>
              <span className="text-sm font-medium text-white mt-1">Base</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">VoltGrid AI automatically shifts up to 85% of total fleet charging load into the green Solar Window to maximize your returns in {stateName}.</p>
        </div>

        {/* Billing History Table */}
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#0a0a0a]">
            <h3 className="text-lg font-semibold text-white">Billing History & AI Savings</h3>
            <button className="text-sm flex items-center text-blue-400 hover:text-blue-300 transition">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs text-gray-500 uppercase bg-[#0a0a0a] border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Billing Period</th>
                  <th className="px-6 py-4 font-medium">Total Energy (kWh)</th>
                  <th className="px-6 py-4 font-medium">Baseline Cost (No AI)</th>
                  <th className="px-6 py-4 font-medium text-white">Actual Billed</th>
                  <th className="px-6 py-4 font-medium text-green-400">AI Savings</th>
                  <th className="px-6 py-4 font-medium text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {billingHistory.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{row.month}</td>
                    <td className="px-6 py-4">{row.totalKw}</td>
                    <td className="px-6 py-4 text-gray-500 line-through">{row.baseline}</td>
                    <td className="px-6 py-4 font-bold text-white">{row.actual}</td>
                    <td className="px-6 py-4 font-bold text-green-400 bg-green-900/10">{row.savings}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 underline text-xs">PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  )
}
