'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, DollarSign, User, ArrowLeft, Phone, Mail } from 'lucide-react'
import { getTicketById, markTicketAsSold } from '@/lib/api'
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
}

export default function BiletDetay() {
  const params = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const data = await getTicketById(params.id as string)
        setTicket(data)
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
                  ₺{ticket.price.toLocaleString()}
                </div>
                {discount > 0 && (
                  <div className="text-sm text-gray-500 line-through">
                    ₺{ticket.originalPrice.toLocaleString()}
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
                <button
                  onClick={handleMarkAsSold}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition"
                >
                  Satıldı Olarak İşaretle
                </button>
              </div>
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

