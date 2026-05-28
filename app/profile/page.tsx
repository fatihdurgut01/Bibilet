'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Ticket, Offer, OfferWithTicket, WantedTicket, getTicketsByOwner, getOffersByUser, getOffersForSeller, getRatingsForSeller, getWantedTicketsByUser, markWantedTicketFulfilled } from '@/lib/api'
import { formatDate, formatShortDate } from '@/lib/format'
import { useToast } from '@/components/ToastProvider'

export default function ProfilePage() {
  const router = useRouter()
  const toast = useToast()
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [myOffers, setMyOffers] = useState<Offer[]>([])
  const [incomingOffers, setIncomingOffers] = useState<OfferWithTicket[]>([])
  const [sellerRating, setSellerRating] = useState<number | null>(null)
  const [wantedTickets, setWantedTickets] = useState<WantedTicket[]>([])

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
      loadData(session.user.id)
    }
    getUser()
  }, [router])

  const loadData = async (uid: string) => {
    const [t, o, incoming, r, w] = await Promise.all([
      getTicketsByOwner(uid),
      getOffersByUser(uid),
      getOffersForSeller(uid),
      getRatingsForSeller(uid),
      getWantedTicketsByUser(uid),
    ])
    setTickets(t)
    setMyOffers(o)
    setIncomingOffers(incoming)
    setWantedTickets(w)
    if (r.length > 0) {
      setSellerRating(r.reduce((a, b) => a + b.score, 0) / r.length)
    }
  }

  const handleWantedAction = async (id: string, action: 'fulfilled' | 'cancelled') => {
    try {
      await markWantedTicketFulfilled(id)
      setWantedTickets(prev => prev.filter(w => w.id !== id))
      toast(
        action === 'fulfilled' ? 'İlan "Bulundu" olarak kapatıldı.' : 'İlan iptal edildi.',
        'success'
      )
    } catch {
      toast('Bir hata oluştu, lütfen tekrar deneyin.', 'error')
    }
  }

  const displayName = user?.user_metadata?.full_name || user?.email || 'Profil'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
      {user?.user_metadata?.full_name && (
        <p className="text-gray-500 mb-8">{user.email}</p>
      )}

      {/* İlanlarım */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">İlanlarım</h2>
        {tickets.length === 0 ? (
          <p className="text-gray-500">Henüz ilanınız yok.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map(t => (
              <Link key={t.id} href={`/bilet/${t.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-100 transition">
                <div>
                  <span className="font-medium text-gray-900">{t.title}</span>
                  <p className="text-sm text-gray-500 mt-0.5">{formatDate(t.eventDate)}</p>
                </div>
                <div className="text-right">
                  <span className="text-primary-600 font-bold">₺{t.price.toLocaleString('tr-TR')}</span>
                  <p className={`text-xs mt-0.5 ${t.status === 'sold' ? 'text-red-500' : 'text-green-600'}`}>
                    {t.status === 'sold' ? 'Satıldı' : 'Aktif'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Gelen Teklifler */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Gelen Teklifler
          {incomingOffers.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {incomingOffers.length}
            </span>
          )}
        </h2>
        {incomingOffers.length === 0 ? (
          <p className="text-gray-500">Henüz biletlerinize teklif gelmedi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Bilet</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Teklif</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Tarih</th>
                  <th className="px-4 py-3 font-medium text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {incomingOffers.map(o => (
                  <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{o.ticketTitle}</td>
                    <td className="px-4 py-3 text-green-700 font-bold">₺{Number(o.amount).toLocaleString('tr-TR')}</td>
                    <td className="px-4 py-3 text-gray-500">{formatShortDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/bilet/${o.ticketId}`}
                        className="text-primary-600 hover:underline text-xs">
                        Bileti Gör →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Teklif Geçmişim */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Verdiğim Teklifler</h2>
        {myOffers.length === 0 ? (
          <p className="text-gray-500">Henüz teklif vermediniz.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Bilet</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Tutar</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {myOffers.map(o => (
                  <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/bilet/${o.ticketId}`} className="text-primary-600 hover:underline">
                        Detaya Git →
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-bold">₺{Number(o.amount).toLocaleString('tr-TR')}</td>
                    <td className="px-4 py-3 text-gray-500">{formatShortDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Arama İlanlarım */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Arama İlanlarım
            {wantedTickets.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {wantedTickets.length}
              </span>
            )}
          </h2>
          <Link href="/bilet-ara"
            className="text-sm text-blue-600 hover:underline font-medium">
            + Yeni İlan
          </Link>
        </div>
        {wantedTickets.length === 0 ? (
          <p className="text-gray-500">Aktif arama ilanınız yok.</p>
        ) : (
          <div className="space-y-3">
            {wantedTickets.map(w => (
              <div key={w.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 truncate">{w.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      w.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {w.status === 'active' ? 'Aktif' : 'Kapalı'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                    <span>📍 {w.location}</span>
                    <span className="text-blue-600 font-semibold">
                      Maks ₺{Number(w.maxPrice).toLocaleString('tr-TR')}
                    </span>
                    <span className="text-xs">{formatShortDate(w.createdAt)}</span>
                  </div>
                </div>
                {w.status === 'active' && (
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleWantedAction(w.id, 'fulfilled')}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition"
                    >
                      ✓ Bulundu
                    </button>
                    <button
                      onClick={() => handleWantedAction(w.id, 'cancelled')}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
                    >
                      İptal Et
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Satıcı Puanım */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Satıcı Puanım</h2>
        {sellerRating === null ? (
          <p className="text-gray-500">Henüz puanlanmadınız.</p>
        ) : (
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
            <span className="text-2xl">⭐</span>
            <span className="text-xl font-bold text-yellow-700">{sellerRating.toFixed(1)}</span>
            <span className="text-gray-500 text-sm">/ 5</span>
          </div>
        )}
      </section>
    </div>
  )
}
