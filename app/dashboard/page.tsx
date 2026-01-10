import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-purple-600">PURPL Dashboard</h1>
          <div className="text-sm text-black truncate max-w-full">{user.email}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-black">Bienvenue !</h2>
          <p className="text-black mb-6 text-sm sm:text-base">
            Créez votre première concertation citoyenne.
          </p>
          <Link
            href="/dashboard/concertations"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 text-sm sm:text-base"
          >
            Voir mes concertations
          </Link>
        </div>
      </main>
    </div>
  )
}
