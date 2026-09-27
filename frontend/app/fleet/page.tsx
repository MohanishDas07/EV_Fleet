import FleetTable from '../../components/FleetTable'

export default function FleetPage() {
  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Fleet Status</h1>
        <p className="text-gray-400 mb-8">Detailed view of all active vehicles and their current charging sessions.</p>
        <FleetTable />
      </div>
    </main>
  )
}
