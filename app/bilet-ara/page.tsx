'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Tag, DollarSign, FileText } from 'lucide-react'
import { createWantedTicket } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ToastProvider'

export default function BiletAra() {
  const router = useRouter()
  const toast = useToast()
  const [userId, setUserId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title:       '',
    category:    'konser',
    location:    '',
    maxPrice:    '',
    description: '',
  })

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session?.user) {
        router.push('/auth/login')
        return
      }
      setUserId(data.session.user.id)
    }
    check()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const price = parseFloat(formData.maxPrice)
    if (!price || price <= 0) {
      toast('Geçerli bir maksimum fiyat girin.', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      await createWantedTicket(
        {
          title:       formData.title,
          category:    formData.category,
          location:    formData.location,
          maxPrice:    price,
          description: formData.description || undefined,
        },
        userId
      )
      toast('Arama ilanınız yayınlandı! Bilet çıkınca satıcılar sizi görecek.', 'success')
      setTimeout(() => router.push('/'), 1500)
    } catch {
      toast('İlan oluşturulurken bir hata oluştu.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <Search className="h-4 w-4" />
            Bilet Aranıyor İlanı
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bilet Ara</h1>
          <p className="text-gray-600">
            Bilet aradığınızı ilan olarak girin. Satıcılar bu ilanı görerek sizinle iletişime geçebilir.
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
              placeholder="Örn: Gökhan Türkmen Konseri"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Şehir / Lokasyon *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="Örn: İstanbul"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Maksimum Ödeyeceğiniz Fiyat (₺) *
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              required
              min="1"
              step="1"
              value={formData.maxPrice}
              onChange={handleChange}
              placeholder="Örn: 1500"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Bu fiyat üstündeki teklifler size gösterilmeyecektir.
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama (opsiyonel)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Örn: Tribün veya VIP fark etmez, acil arıyorum..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Yayınlanıyor...' : '🔍 Arama İlanı Yayınla'}
          </button>
        </form>
      </div>
    </div>
  )
}
