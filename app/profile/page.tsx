 'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Ticket, Offer, getOffersByUser, getRatingsForSeller } from '@/lib/api'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [sellerRating, setSellerRating] = useState<number | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !session.user) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
      loadData(session.user.id)
    }
    getUser()
  }, [router])

  const loadData = async (uid: string) => {
    // fetch tickets from supabase table
    const { data: t, error } = await supabase
      .from<Ticket>('tickets')
      .select('*')
      .eq('owner_id', uid)
    if (!error && t) setTickets(t)
    const o = await getOffersByUser(uid)
    setOffers(o)
    const r = await getRatingsForSeller(uid)
    if (r.length > 0) {
      setSellerRating(r.reduce((a,b)=>a+b.score,0)/r.length)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">{user?.email || 'Profil'}</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">İlanlarım</h2>
        {tickets.length === 0 ? (
          <p>Henüz ilanınız yok.</p>
        ) : (
          <div className="space-y-4">
            {tickets.map(t => (
              <Link key={t.id} href={`/bilet/${t.id}`} className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="flex justify-between">
                  <span className="font-medium">{t.title}</span>
                  <span className="text-primary-600 font-bold">₺{t.price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500">{new Date(t.eventDate).toLocaleDateString()}</p>
                <p className="text-sm mt-1">Durum: {t.status}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Teklif Geçmişim</h2>
        {offers.length === 0 ? (
          <p>Henüz teklif vermediniz.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr>
                <th className="py-2">Bilet</th>
                <th className="py-2">Tutar</th>
                <th className="py-2">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(o => (
                <tr key={o.id} className="border-t">
                  <td className="py-2"><Link href={`/bilet/${o.ticketId}`} className="text-primary-600 hover:underline">Detay</Link></td>
                  <td className="py-2">₺{o.amount.toLocaleString()}</td>
                  <td className="py-2">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Satıcı Puanım</h2>
        {sellerRating === null ? (
          <p>Henüz puanlanmadınız.</p>
        ) : (
          <p className="text-lg">Ortalama: {sellerRating.toFixed(1)} / 5</p>
        )}
      </section>
    </div>
  )
}
