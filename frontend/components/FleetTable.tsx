"use client"

import { useState, useEffect } from 'react'
import { Battery, Zap, AlertTriangle, CheckCircle2, ArrowDownCircle } from 'lucide-react'

export default function FleetTable() {
  const [fleet, setFleet] = useState<any[]>([])

  const fetchFleet = () => {
    // Determine profile from current dashboard state (mocked via localStorage or assume germany for demo if not provided, 
    // but we can just fetch and let API randomize it)
    fetch(`http://localhost:8000/api/fleet/status?profile=japan`)
      .then(res => res.json())
      .then(json => setFleet(json.data))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchFleet()
    const interval = setInterval(fetchFleet, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden mt-6">
      <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#0a0a0a]">
        <h3 className="text-lg font-semibold text-white">Live Charger Telemetry (MQTT)</h3>
        <span className="text-xs font-medium px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
          ● Live Updates
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-500 uppercase bg-[#0a0a0a] border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 font-medium">Vehicle ID</th>
              <th className="px-6 py-4 font-medium">Charger</th>
              <th className="px-6 py-4 font-medium">State of Charge</th>
              <th className="px-6 py-4 font-medium">Power (kW)</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {fleet.map((v, i) => (
              <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-semibold text-white">{v.id}</td>
                <td className="px-6 py-4">{v.charger}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 font-medium text-white">{v.soc}%</span>
                    <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${v.soc < 20 ? 'bg-red-500' : v.soc == 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${v.soc}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-4 font-medium ${v.kw < 0 ? 'text-purple-400' : 'text-gray-300'}`}>
                  {v.kw} kW
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {v.status === 'Complete' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {v.status === 'Fast Charge' && <Zap className="w-4 h-4 text-yellow-500" />}
                    {v.status === 'V2G Discharging' && <ArrowDownCircle className="w-4 h-4 text-purple-500" />}
                    {v.status === 'Charging' && <Battery className="w-4 h-4 text-blue-500" />}
                    <span className={
                      v.status === 'Complete' ? 'text-green-400' : 
                      v.status === 'V2G Discharging' ? 'text-purple-400' : 'text-gray-300'
                    }>{v.status}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
