'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, ArrowLeft, Phone, Mail, Pencil } from 'lucide-react'
import { getTicketById, markTicketAsSold, createOffer, addRating, getRatingsForSeller } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ToastProvider'
import { formatDate, formatShortDate, formatPrice } from '@/lib/format'
import Link from 'next/link'

interface Ticket {
  id: string
  title: string
  description: string
  eventDate: string
  location: string
  price: number
  originalPrice: number
  category: string
  contact: string
  createdAt: string
  status: 'available' | 'sold'
  ownerId: string
  currency: string
  imageUrl?: string
}

export default function BiletDetay() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [offerAmount, setOfferAmount] = useState('')
  const [sellerRatings, setSellerRatings] = useState<number[]>([])
  const [rating, setRating] = useState(0)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession()
      setCurrentUserId(data.session?.user?.id || '')
    }
    getUser()
  }, [])

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const data = await getTicketById(params.id as string)
        setTicket(data)
        if (data) {
          const r = await getRatingsForSeller(data.ownerId)
          setSellerRatings(r.map(rr => rr.score))
        }
      } catch (error) {
        console.error('Bilet yüklenirken hata oluştu:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTicket()
  }, [params.id])

  const handleMarkAsSold = async () => {
    if (!ticket || !confirm('Bu bileti satıldı olarak işaretlemek istediğinizden emin misiniz?')) return
    try {
      await markTicketAsSold(ticket.id)
      toast('Bilet satıldı olarak işaretlendi.', 'success')
      router.push('/')
    } catch {
      toast('Bir hata oluştu. Lütfen tekrar deneyin.', 'error')
    }
  }

  const submitOffer = async () => {
    const amount = Number(offerAmount)
    if (!offerAmount || isNaN(amount) || amount <= 0) {
      toast('Geçerli bir teklif tutarı girin.', 'error')
      return
    }
    if (ticket) {
      const minOffer = Math.floor(ticket.price * 0.5)
      const maxOffer = Math.ceil(ticket.originalPrice * 1.1)
      if (amount < minOffer) {
        toast(`Minimum teklif tutarı ₺${minOffer.toLocaleString('tr-TR')} (bilet fiyatının %50'si).`, 'error')
        return
      }
      if (amount > maxOffer) {
        toast(`Maksimum teklif tutarı ₺${maxOffer.toLocaleString('tr-TR')} (orijinal fiyatın %110'u).`, 'error')
        return
      }
    }
    try {
      if (ticket) {
        await createOffer(ticket.id, currentUserId, amount)
        toast('Teklifiniz başarıyla gönderildi.', 'success')
        setOfferAmount('')
      }
    } catch {
      toast('Teklif gönderilirken hata oluştu.', 'error')
    }
  }

  const submitRating = async () => {
    if (!ticket) return
    if (rating < 1 || rating > 5) {
      toast('Lütfen 1 ile 5 arasında bir puan seçin.', 'error')
      return
    }
    try {
      await addRating(ticket.ownerId, currentUserId, rating)
      const r = await getRatingsForSeller(ticket.ownerId)
      setSellerRatings(r.map(rr => rr.score))
      toast('Puanınız kaydedildi.', 'success')
    } catch {
      toast('Puanlama sırasında bir hata oluştu.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">Bilet bulunamadı.</p>
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  const isOwner   = !!currentUserId && currentUserId === ticket.ownerId
  const isVisitor = !!currentUserId && !isOwner
  const isEmail   = ticket.contact.includes('@')
  const discount  = ticket.originalPrice - ticket.price
  const discountPercent = ((discount / ticket.originalPrice) * 100).toFixed(0)
  const avgRating = sellerRatings.length
    ? (sellerRatings.reduce((a, b) => a + b, 0) / sellerRatings.length).toFixed(1)
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Geri Dön
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {ticket.imageUrl && (
          <div className="h-64 w-full overflow-hidden">
            <img src={ticket.imageUrl} alt={ticket.title} className="object-cover h-full w-full" />
          </div>
        )}
        <div className="p-8">
          {/* Başlık + Fiyat */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-3 uppercase">
                {ticket.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
              {avgRating && (
                <p className="text-sm text-gray-500">⭐ Satıcı puanı: {avgRating} / 5 ({sellerRatings.length} değerlendirme)</p>
              )}
            </div>
            <div className="text-right md:mt-0">
              {ticket.status === 'available' ? (
                <>
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {formatPrice(ticket.price, ticket.currency)}
                  </div>
                  {discount > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(ticket.originalPrice, ticket.currency)}
                    </div>
                  )}
                </>
              ) : (
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  Satıldı
                </span>
              )}
            </div>
          </div>

          {/* İndirim bandı */}
          {discount > 0 && ticket.status === 'available' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">
                💰 %{discountPercent} indirim! {formatPrice(discount, ticket.currency)} tasarruf edin
              </p>
            </div>
          )}

          {/* Tarih + Lokasyon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-primary-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Etkinlik Tarihi</p>
                <p className="text-gray-900 font-medium">{formatDate(ticket.eventDate)}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-primary-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Lokasyon</p>
                <p className="text-gray-900 font-medium">{ticket.location}</p>
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Açıklama</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{ticket.description}</p>
          </div>

          {/* ===== SAHİP GÖRÜNÜMÜ ===== */}
          {isOwner && ticket.status === 'available' && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">İlanınızı Yönetin</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/bilet-ekle?edit=${ticket.id}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition"
                >
                  <Pencil className="h-4 w-4" />
                  Düzenle
                </Link>
                <button
                  onClick={handleMarkAsSold}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Satıldı Olarak İşaretle
                </button>
              </div>
            </div>
          )}

          {/* ===== ZİYARETÇİ GÖRÜNÜMÜ ===== */}
          {!isOwner && ticket.status === 'available' && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">İletişim</h2>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  {isEmail
                    ? <Mail className="h-5 w-5 text-primary-600 mr-3" />
                    : <Phone className="h-5 w-5 text-primary-600 mr-3" />
                  }
                  <div>
                    <p className="text-sm text-gray-500 mb-1">İletişim Bilgisi</p>
                    <p className="text-gray-900 font-medium text-lg">{ticket.contact}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Bu biletle ilgileniyorsanız yukarıdaki iletişim bilgisi üzerinden satıcıyla iletişime geçebilirsiniz.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={isEmail ? `mailto:${ticket.contact}` : `tel:${ticket.contact}`}
                  onClick={async () => {
                    if (isEmail) {
                      try {
                        await navigator.clipboard.writeText(ticket.contact)
                        toast(`E-posta adresi kopyalandı: ${ticket.contact}`, 'success')
                      } catch {
                        toast('E-posta istemciniz açılıyor...', 'success')
                      }
                    }
                  }}
                  className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition text-center shadow-md"
                >
                  {isEmail ? '📧 E-posta Gönder' : '📞 Ara'}
                </a>

                {isVisitor && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={Math.floor(ticket.price * 0.5)}
                        max={Math.ceil(ticket.originalPrice * 1.1)}
                        placeholder="Teklif tutarı"
                        value={offerAmount}
                        onChange={e => setOfferAmount(e.target.value)}
                        className="w-36 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        onClick={submitOffer}
                        className="px-5 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition whitespace-nowrap"
                      >
                        Teklif Ver
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Min: ₺{Math.floor(ticket.price * 0.5).toLocaleString('tr-TR')} · Maks: ₺{Math.ceil(ticket.originalPrice * 1.1).toLocaleString('tr-TR')}
                    </p>
                  </div>
                )}

                {!currentUserId && (
                  <Link
                    href="/auth/login"
                    className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg text-center hover:bg-gray-50 transition"
                  >
                    Teklif vermek için giriş yap
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Satıcıyı puanla — sadece giriş yapmış ziyaretçilere */}
          {isVisitor && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Satıcıyı Puanla</h2>
              <div className="flex items-center gap-3">
                <select
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={0}>Puan seç</option>
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} ⭐</option>
                  ))}
                </select>
                <button
                  onClick={submitRating}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Gönder
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 mt-6">
            <p className="text-xs text-gray-500">
              Bilet {formatShortDate(ticket.createdAt)} tarihinde eklendi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
