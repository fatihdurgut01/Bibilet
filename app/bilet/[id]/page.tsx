'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, DollarSign, User, ArrowLeft, Phone, Mail } from 'lucide-react'
import { getTicketById, markTicketAsSold, createOffer, addRating, getRatingsForSeller, Offer } from '@/lib/api'
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
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [offerAmount, setOfferAmount] = useState('')
  const [sellerRatings, setSellerRatings] = useState<number[]>([])
  const [rating, setRating] = useState(0)

  useEffect(() => {
    // Mevcut kullanıcı ID'sini localStorage'dan al
    const userId = localStorage.getItem('userId') || ''
    setCurrentUserId(userId)
  }, [])

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const data = await getTicketById(params.id as string)
        setTicket(data)
        // load existing ratings for seller
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
    if (!ticket || !confirm('Bu bileti satıldı olarak işaretlemek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await markTicketAsSold(ticket.id)
      router.push('/')
    } catch (error) {
      console.error('Hata oluştu:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  const submitOffer = async () => {
    if (!offerAmount || isNaN(Number(offerAmount)) || Number(offerAmount) <= 0) {
      alert('Geçerli bir teklif girin')
      return
    }
    try {
      if (ticket) {
        await createOffer(ticket.id, currentUserId, Number(offerAmount))
        alert('Teklifiniz gönderildi')
        setOfferAmount('')
      }
    } catch (e) {
      console.error(e)
      alert('Teklif gönderilirken hata oluştu')
    }
  }

  const submitRating = async () => {
    if (!ticket) return
    if (rating < 1 || rating > 5) {
      alert('1-5 arası puan verin')
      return
    }
    try {
      await addRating(ticket.ownerId, currentUserId, rating)
      const r = await getRatingsForSeller(ticket.ownerId)
      setSellerRatings(r.map(rr => rr.score))
      alert('Puanınız kaydedildi')
    } catch (e) {
      console.error(e)
      alert('Puanlama sırasında hata oluştu')
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
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  const isEmail = ticket.contact.includes('@')
  const discount = ticket.originalPrice - ticket.price
  const discountPercent = ((discount / ticket.originalPrice) * 100).toFixed(0)

  const formatPrice = (amount: number, currency: string) => {
    const formatted = amount.toLocaleString()
    switch (currency) {
      case 'USD':
        return `$${formatted}`
      case 'EUR':
        return `€${formatted}`
      case 'TRY':
      default:
        return `₺${formatted}`
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Geri Dön
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {ticket.imageUrl && (
          <div className="h-64 w-full overflow-hidden">
            <img
              src={ticket.imageUrl}
              alt={ticket.title}
              className="object-cover h-full w-full"
            />
          </div>
        )}
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-3 uppercase">
                {ticket.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {ticket.title}
              </h1>
            </div>
            {ticket.status === 'available' && (
              <div className="text-right md:text-left md:mt-0">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {formatPrice(ticket.price, ticket.currency)}
                </div>
                {discount > 0 && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatPrice(ticket.originalPrice, ticket.currency)}
                  </div>
                )}
              </div>
            )}
            {ticket.status === 'sold' && (
              <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold inline-block">
                Satıldı
              </span>
            )}
          </div>

          {discount > 0 && ticket.status === 'available' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">
                💰 %{discountPercent} indirim! {discount.toLocaleString()}₺ tasarruf edin
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-primary-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Etkinlik Tarihi</p>
                <p className="text-gray-900 font-medium">
                  {new Date(ticket.eventDate).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
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

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Açıklama</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {ticket.description}
            </p>
          </div>

          {ticket.status === 'available' && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">İletişim</h2>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  {isEmail ? (
                    <Mail className="h-5 w-5 text-primary-600 mr-3" />
                  ) : (
                    <Phone className="h-5 w-5 text-primary-600 mr-3" />
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">İletişim Bilgisi</p>
                    <p className="text-gray-900 font-medium text-lg">{ticket.contact}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Bu biletle ilgileniyorsanız yukarıdaki iletişim bilgisi üzerinden satıcıyla iletişime geçebilirsiniz.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <a
                  href={isEmail ? `mailto:${ticket.contact}` : `tel:${ticket.contact}`}
                  className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition text-center shadow-md hover:shadow-lg"
                >
                  {isEmail ? '📧 E-posta Gönder' : '📞 Ara'}
                </a>
                {currentUserId === ticket.ownerId && (
                  <button
                    onClick={handleMarkAsSold}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition"
                  >
                    Satıldı Olarak İşaretle
                  </button>
                )}
                {currentUserId && currentUserId !== ticket.ownerId && (
                  <div className="flex items-center mt-4">
                    <input
                      type="number"
                      min="1"
                      placeholder="Teklifiniz"
                      value={offerAmount}
                      onChange={e => setOfferAmount(e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded-md mr-2"
                    />
                    <button
                      onClick={submitOffer}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                      Teklif Ver
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentUserId && currentUserId !== ticket.ownerId && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold mb-3">Satıcıyı Puanla</h2>
              <div className="flex items-center space-x-2">
                <select
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                  className="border border-gray-300 rounded-md p-1"
                >
                  <option value={0}>Puan seç</option>
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button
                  onClick={submitRating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Gönder
                </button>
              </div>
              {sellerRatings.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Ortalama puan: {(sellerRatings.reduce((a,b)=>a+b,0)/sellerRatings.length).toFixed(1)} / 5
                </p>
              )}
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 mt-6">
            <p className="text-xs text-gray-500">
              Bilet {new Date(ticket.createdAt).toLocaleDateString('tr-TR')} tarihinde eklendi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

