 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, DollarSign, FileText, Tag } from 'lucide-react'
import { createTicket, updateTicket, getTicketById } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ToastProvider'

// Yerel saat dilimiyle bugünün tarihini YYYY-MM-DDTHH:mm formatında döndürür
function localNow(): string {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export default function BiletEkle() {
  const router = useRouter()
  const toast = useToast()
  const [userId, setUserId] = useState<string>('')
  const [editId, setEditId] = useState<string | null>(null)
  const [minDate] = useState(localNow)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    price: '',
    originalPrice: '',
    category: 'konser',
    currency: 'TRY',
    imageUrl: '',
    contact: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session?.user) {
        router.push('/auth/login')
        return
      }
      setUserId(data.session.user.id)

      // Edit modu: URL'den ?edit=UUID oku
      const id = new URLSearchParams(window.location.search).get('edit')
      if (id) {
        setEditId(id)
        try {
          const ticket = await getTicketById(id)
          // datetime-local için ISO formatı (YYYY-MM-DDTHH:mm)
          const localDate = ticket.eventDate
            ? new Date(ticket.eventDate).toISOString().slice(0, 16)
            : ''
          setFormData({
            title:         ticket.title,
            description:   ticket.description,
            eventDate:     localDate,
            location:      ticket.location,
            price:         String(ticket.price),
            originalPrice: String(ticket.originalPrice),
            category:      ticket.category,
            currency:      ticket.currency,
            imageUrl:      ticket.imageUrl ?? '',
            contact:       ticket.contact,
          })
        } catch {
          toast('Bilet yüklenemedi.', 'error')
        }
      }
    }
    init()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // simple client side validations
    if (parseFloat(formData.price) <= 0 || parseFloat(formData.originalPrice) <= 0) {
      toast('Fiyatlar sıfırdan büyük olmalıdır.', 'error')
      setIsSubmitting(false)
      return
    }
    if (parseFloat(formData.price) > parseFloat(formData.originalPrice) * 1.1) {
      toast('Satış fiyatı orijinal fiyatın %110\'unu geçemez.', 'error')
      setIsSubmitting(false)
      return
    }
    if (formData.eventDate && new Date(formData.eventDate) < new Date()) {
      toast('Etkinlik tarihi geçmiş olamaz.', 'error')
      setIsSubmitting(false)
      return
    }

    try {
      const ticketData = {
        ...formData,
        price:         parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
      }
      if (editId) {
        await updateTicket(editId, ticketData)
        toast('Bilet başarıyla güncellendi.', 'success')
      } else {
        await createTicket(ticketData, userId)
        toast('Biletiniz yayınlandı.', 'success')
      }
      router.push('/')
    } catch (error) {
      console.error('Bilet kaydedilirken hata oluştu:', error)
      toast('Bilet kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Optionally validate event name against Ticketmaster API
  const validateEvent = async () => {
    if (!formData.title) return
    try {
      const response = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(
          formData.title,
        )}&apikey=YOUR_API_KEY`
      )
      const data = await response.json()
      if (data && data.page && data.page.totalElements === 0) {
        toast('Girilen etkinlik adına uygun bir sonuç bulunamadı. Lütfen kontrol edin.', 'error')
      }
      // noter: burada sonuçları UI'da göstermek veya başka bir işlem yapmak mümkün
      console.log('Etkinlik doğrulama sonuçları:', data)
    } catch (e) {
      console.error('Etkinlik doğrulanamadı:', e)
    }
  }
  const handleDateValidation = () => {
    if (formData.eventDate && new Date(formData.eventDate) < new Date()) {
      toast('Etkinlik tarihi geçmiş olamaz.', 'error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{editId ? 'Bileti Düzenle' : 'Bilet Ekle'}</h1>
          <p className="text-gray-600">
            Gidemeyeceğiniz etkinlik biletinizi burada paylaşın. Diğer kullanıcılar biletinizi görebilir ve sizinle iletişime geçebilir.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Etkinlik Adı *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              onBlur={validateEvent}
              placeholder="Örn: Tarkan Konseri"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Bilet hakkında detaylı bilgi verin..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Etkinlik Tarihi ve Saati *
              </label>
              <input
                type="datetime-local"
                id="eventDate"
                name="eventDate"
                required
                min={minDate}
                value={formData.eventDate}
                onChange={handleChange}
                onBlur={handleDateValidation}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Kategori *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="konser">Konser</option>
                <option value="tiyatro">Tiyatro</option>
                <option value="spor">Spor</option>
                <option value="festival">Festival</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Lokasyon *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="Örn: İstanbul, Zorlu Center"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Orijinal Fiyat (₺) *
              </label>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                required
                min="0"
                step="0.01"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Satış Fiyatı (₺) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Para Birimi *
              </label>
              <select
                id="currency"
                name="currency"
                required
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="TRY">TL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Bilet Görseli (URL)
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Bir görsel URL'si eklemek güveni artırır. Dosya yükleme desteklenmez.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
              İletişim Bilgisi *
            </label>
            <input
              type="text"
              id="contact"
              name="contact"
              required
              value={formData.contact}
              onChange={handleChange}
              placeholder="Telefon numarası veya e-posta"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Bu bilgi biletinizi gören kişiler tarafından görülebilir.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (editId ? 'Güncelleniyor...' : 'Ekleniyor...') : (editId ? 'Güncelle' : 'Bileti Yayınla')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

