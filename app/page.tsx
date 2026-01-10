import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">PURPL</h1>
        <p className="text-xl mb-8">Plateforme de concertation citoyenne</p>
        <Link 
          href="/login"
          className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Commencer
        </Link>
      </div>
    </main>
  )
}
