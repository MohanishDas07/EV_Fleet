"use client"

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell } from 'recharts'
import { Activity, Zap, TrendingDown, BatteryCharging, Globe, ShieldAlert, Cpu } from 'lucide-react'

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  
  // Global Settings State
  const [maxLoad, setMaxLoad] = useState(200)
  const [stateName, setStateName] = useState('Delhi')
  const [baseRate, setBaseRate] = useState(4.00)
  const [aggressiveness, setAggressiveness] = useState('aggressive')
  const [v2gEnabled, setV2gEnabled] = useState(true)

  useEffect(() => {
    // 1. Fetch Global Settings from Cloud Database (Phase 11)
    fetch('http://localhost:8000/api/settings')
      .then(res => res.json())
      .then(data => {
        setMaxLoad(data.max_load_kw)
        setStateName(data.state_name)
        setBaseRate(data.state_rate)
        setAggressiveness(data.aggressiveness)
        setV2gEnabled(data.v2g_enabled)
      })
      .catch(err => console.error("Failed to fetch settings from DB", err))

    // 2. Fetch live simulated power curve (We will force it to the "india" profile to get the solar ToD curve shape)
    fetch(`http://localhost:8000/api/telemetry/power?profile=india`)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error(err))
  }, [])

  if (!data) return <div className="text-white p-8">Loading Global Unification Engine...</div>

  // Dynamic Math for Metrics based on selected state
  const solarRate = baseRate * 0.8
  const currentTariffText = `₹${solarRate.toFixed(2)}/kWh (-20% ToD)`
  // Simulated savings estimation for the UI based on baseRate scale
  const simulatedSavings = `₹ ${(baseRate * 6550).toLocaleString(undefined, {maximumFractionDigits:0})}`

  const socData = [
    { name: '0-20%', value: 2, color: '#ef4444' },
    { name: '21-80%', value: 15, color: '#3b82f6' },
    { name: '81-100%', value: 7, color: '#22c55e' }
  ]

  return (
    <div className="space-y-6">
      {/* Dynamic Profile Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111] border border-gray-800 p-4 rounded-xl gap-4">
        <div className="flex items-center space-x-3">
          <Globe className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Global Unified Simulation</h2>
            <p className="text-gray-400 text-xs">Active Region: <span className="text-white font-medium">{stateName}</span></p>
          </div>
        </div>
        
        {/* Dynamic AI Badges */}
        <div className="flex flex-wrap gap-2">
           <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs rounded-full flex items-center font-bold">
            <Cpu className="w-3 h-3 mr-1" /> AI: {aggressiveness.charAt(0).toUpperCase() + aggressiveness.slice(1)}
          </span>
          <span className={`px-3 py-1 border text-xs rounded-full flex items-center font-bold ${v2gEnabled ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
            <Zap className="w-3 h-3 mr-1" /> V2G: {v2gEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#111] border border-gray-800 p-5 rounded-xl shadow-lg shadow-black/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Grid Status</p>
              <h3 className="text-xl font-bold text-white mt-2">Active</h3>
            </div>
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-green-400 mt-4 flex items-center">
            <TrendingDown className="w-3 h-3 mr-1" /> Load Optimized
          </p>
        </div>

        <div className="bg-[#111] border border-gray-800 p-5 rounded-xl shadow-lg shadow-black/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Avg Fleet SoC</p>
              <h3 className="text-3xl font-bold text-white mt-2">{data.fleet_soc_avg} <span className="text-lg text-gray-500 font-medium">%</span></h3>
            </div>
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <BatteryCharging className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Live Aggregation</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/40 to-black border border-green-900/50 p-5 rounded-xl shadow-lg shadow-black/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-400/80 text-sm font-medium">Active Tariff Block</p>
              <h3 className="text-xl font-bold text-green-400 mt-2">{currentTariffText}</h3>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 font-medium">Base: ₹{baseRate.toFixed(2)}/kWh</p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/40 to-black border border-blue-900/50 p-5 rounded-xl shadow-lg shadow-black/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-400/80 text-sm font-medium">Simulated YTD Savings</p>
              <h3 className="text-3xl font-bold text-blue-400 mt-2">{simulatedSavings}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Power Orchestration Chart */}
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl shadow-lg shadow-black/50 lg:col-span-2">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">24H Power Load Profile</h2>
              <p className="text-sm text-gray-500 mt-1">Live empirical data simulation for grid impacts.</p>
            </div>
          </div>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.curve} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="time" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} dy={10} />
                {/* Dynamically adjust YAxis domain based on the maxLoad to always frame the graph perfectly */}
                <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} dx={-10} domain={[-100, maxLoad + 50]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                
                {/* DYNAMIC REFERENCE LINE TIED TO GLOBAL SETTINGS */}
                <ReferenceLine 
                  y={maxLoad} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3" 
                  label={{ position: 'top', value: `Transformer Limit (${maxLoad} kW)`, fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} 
                />
                
                <ReferenceLine y={0} stroke="#666" />
                <Line 
                  type="monotone" 
                  dataKey="kw" 
                  stroke={'#3b82f6'} 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#111', stroke: '#3b82f6', strokeWidth: 2 }} 
                  activeDot={{ r: 6 }}
                  name="Power (kW)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Battery SoC Distribution Chart */}
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl shadow-lg shadow-black/50">
          <h2 className="text-xl font-bold text-white tracking-tight">Fleet Battery Status</h2>
          <p className="text-sm text-gray-500 mt-1">State of Charge (SoC) Distribution.</p>
          
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={socData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {socData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3 mt-2">
            {socData.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-400">{item.name} SoC</span>
                </div>
                <span className="font-semibold text-white">{item.value} Buses</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
