"use client"

import { useState, useEffect } from 'react'
import { Save, Server, ShieldAlert, Cpu, Network, ZapOff, MapPin } from 'lucide-react'

export default function SettingsPage() {
  const [maxLoad, setMaxLoad] = useState(200)
  const [v2gEnabled, setV2gEnabled] = useState(true)
  const [aggressiveness, setAggressiveness] = useState('aggressive')
  
  // Dynamic State Tariff Data
  const [states, setStates] = useState<{state: string, rate: number}[]>([])
  const [selectedState, setSelectedState] = useState('Delhi')
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Load AI configuration from Cloud Database on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/settings')
      .then(res => res.json())
      .then(data => {
        setMaxLoad(data.max_load_kw)
        setSelectedState(data.state_name)
        setV2gEnabled(data.v2g_enabled)
        setAggressiveness(data.aggressiveness)
      })
      .catch(err => console.error("Failed to fetch global settings from DB", err))
  }, [])

  const fetchStates = () => {
    setLoading(true)
    fetch('http://localhost:8000/api/tariffs/states', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setStates(data.states)
        
        // We no longer rely on localStorage to set default state.
        // It comes from the DB fetch in the other useEffect.
        setLoading(false)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch state tariffs", err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchStates()
  }, [])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('http://localhost:8000/api/tariffs/sync', { method: 'POST' })
      const data = await response.json()
      alert(`Backend Scraper Success: ${data.message}`)
      fetchStates() // Refresh dropdown with new scraped prices
    } catch(err) {
      alert("Error syncing tariffs!")
    } finally {
      setIsSyncing(false)
    }
  }
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStateName = e.target.value
    setSelectedState(newStateName)
  }

  const handleSave = async () => {
    // Find the current rate for the selected state
    const stateObj = states.find(s => s.state === selectedState)
    const rate = stateObj ? stateObj.rate : 4.00

    try {
      const response = await fetch('http://localhost:8000/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_load_kw: maxLoad,
          state_name: selectedState,
          state_rate: rate,
          aggressiveness: aggressiveness,
          v2g_enabled: v2gEnabled
        })
      })
      if (response.ok) {
        alert(`Settings saved to Cloud Database successfully!\n- Active Region: ${selectedState}\n- Load Limit: ${maxLoad}kW\n- V2G Enabled: ${v2gEnabled}\n- AI Mode: ${aggressiveness}`)
      } else {
        alert("Failed to save to database.")
      }
    } catch(err) {
      console.error(err)
      alert("Error contacting the cloud database.")
    }
  }

  const handleEpo = () => {
    alert("⚠️ EMERGENCY POWER OFF (EPO) INITIATED! ⚠️\n\nTriggering OCPP 2.0.1 commands to drop all active charging sessions to 0kW instantly.")
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-20">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Platform Settings</h1>
            <p className="text-gray-400">Configure your tenant profile, regional tariffs, and AI orchestration parameters.</p>
          </div>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center transition">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: General & Hardware */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Tenant Profile */}
            <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 bg-[#0a0a0a] flex items-center">
                <Server className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="font-semibold text-white">Tenant Profile</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Fleet Operator Name</label>
                  <input type="text" defaultValue="Demo Fleet Ops" className="w-full bg-black border border-gray-700 text-white rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Subdomain Slug</label>
                  <input type="text" defaultValue="tenant-a" disabled className="w-full bg-gray-900 border border-gray-800 text-gray-500 rounded-lg p-2.5 text-sm cursor-not-allowed" />
                </div>
                
                {/* DYNAMIC REGION SELECTOR */}
                <div className="pt-2">
                  <div className="flex justify-between items-end mb-1">
                    <label className="flex items-center text-xs font-bold text-blue-400 uppercase">
                      <MapPin className="w-3 h-3 mr-1" /> Regional Depot Location
                    </label>
                    <button 
                      onClick={handleSync} 
                      disabled={isSyncing}
                      className="text-[10px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-2 py-1 rounded border border-blue-500/20 transition disabled:opacity-50"
                    >
                      {isSyncing ? "Scraping SERC Data..." : "⟳ Sync Live Tariffs"}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-2">Select your state to fetch official EV Commercial HT Tariffs.</p>
                  <select 
                    value={selectedState}
                    onChange={handleStateChange}
                    disabled={loading || isSyncing}
                    className="w-full bg-black border border-blue-500/50 text-white rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none transition cursor-pointer"
                  >
                    {loading ? (
                      <option>Fetching official rates...</option>
                    ) : (
                      states.map(s => (
                        <option key={s.state} value={s.state}>
                          {s.state} (₹{s.rate.toFixed(2)}/kWh Base)
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Hardware Protocols */}
            <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 bg-[#0a0a0a] flex items-center">
                <Network className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="font-semibold text-white">Active Protocols</h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between p-3 border border-green-500/20 bg-green-500/5 rounded-lg">
                  <span className="text-sm font-medium text-white">OCPP 2.0.1</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                </div>
                <div className="flex items-center justify-between p-3 border border-green-500/20 bg-green-500/5 rounded-lg">
                  <span className="text-sm font-medium text-white">ISO 15118 (Plug & Charge)</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: AI Orchestration */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Settings */}
            <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 bg-[#0a0a0a] flex items-center">
                <Cpu className="w-5 h-5 text-blue-400 mr-2" />
                <h3 className="font-semibold text-white">TD3 AI Orchestration Engine</h3>
              </div>
              
              <div className="p-6 space-y-8">
                
                {/* Max Load Slider */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <label className="block text-sm font-bold text-white mb-1">Transformer Load Limit (kW)</label>
                      <p className="text-xs text-gray-500">The absolute maximum power draw allowed before AI throttling kicks in.</p>
                    </div>
                    <span className="text-xl font-bold text-blue-400">{maxLoad} kW</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="500" 
                    step="10"
                    value={maxLoad} 
                    onChange={(e) => setMaxLoad(Number(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2 font-medium">
                    <span>50 kW</span>
                    <span>250 kW</span>
                    <span>500 kW</span>
                  </div>
                </div>

                {/* Aggressiveness Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-white mb-1">Peak Shaving Aggressiveness</label>
                  <p className="text-xs text-gray-500 mb-3">Determines how aggressively the Reinforcement Learning model punishes charging during peak tariff windows.</p>
                  <select 
                    value={aggressiveness}
                    onChange={(e) => setAggressiveness(e.target.value)}
                    className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="conservative">Conservative (Prioritize 100% SoC by departure, higher cost)</option>
                    <option value="balanced">Balanced (Optimal mix of cost savings and charge completion)</option>
                    <option value="aggressive">Aggressive Maximum Savings (Strict 0kW during peak hours)</option>
                  </select>
                </div>

                <hr className="border-gray-800" />

                {/* V2G Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Enable ISO 15118 V2G Discharging</h4>
                    <p className="text-xs text-gray-500 max-w-md">Allow the AI to physically discharge vehicle batteries back into the grid during extreme peak tariff periods to maximize arbitrage.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={v2gEnabled}
                      onChange={() => setV2gEnabled(!v2gEnabled)}
                    />
                    <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

              </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-900/50 bg-red-900/10 rounded-xl overflow-hidden mt-8">
              <div className="p-4 border-b border-red-900/30 flex items-center text-red-500">
                <ShieldAlert className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Danger Zone</h3>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Emergency Stop All Chargers</p>
                  <p className="text-xs text-gray-500 mt-1">Immediately drop all actively charging stations to 0kW via OCPP trigger.</p>
                </div>
                <button onClick={handleEpo} className="bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/50 px-4 py-2 rounded-lg text-sm font-bold flex items-center transition">
                  <ZapOff className="w-4 h-4 mr-2" /> EPO Trigger
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  )
}
