'use client'

import Link from 'next/link'
import { Ticket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // read supabase session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setUserName(data.session?.user?.user_metadata?.full_name || data.session?.user?.email || null)
    }
    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUserName(session?.user?.user_metadata?.full_name || session?.user?.email || null)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserName(null)
    setSession(null)
    router.push('/auth/login')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Ticket className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-primary-600">BiBilet</span>
          </Link>
          <div className="flex space-x-4 items-center">
            {session ? (
              <>
                <span className="text-gray-700 text-sm">Merhaba, {userName}</span>
                <button
                  className="text-red-600 hover:text-red-800 text-sm"
                  onClick={handleLogout}
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Giriş
                </Link>
                <Link
                  href="/auth/register"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Kayıt
                </Link>
              </>
            )}
            {session && (
              <Link
                href="/profile"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Profil
              </Link>
            )}
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Ana Sayfa
            </Link>
            <Link
              href="/nasil-calisir"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Nasıl Çalışır
            </Link>
            <Link
              href="/bilet-ara"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              🔍 Bilet Ara
            </Link>
            <Link
              href="/bilet-ekle"
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition"
            >
              Bilet Sat
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
