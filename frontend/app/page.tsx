import Dashboard from '../components/Dashboard'
import FleetTable from '../components/FleetTable'

export default function Home() {
  return (
    <main className="text-white">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-gray-400 mt-1">Real-time performance and grid compliance for Tenant-A.</p>
        </div>
        
        <Dashboard />
        
        <div className="mt-8">
          <FleetTable />
        </div>
      </div>
    </main>
  )
}
