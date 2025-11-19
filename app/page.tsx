'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, DollarSign, Search, Filter, ArrowUpDown } from 'lucide-react'
import { getTickets } from '@/lib/api'

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

type SortOption = 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc'

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-asc')

  useEffect(() => {
    const loadTickets = async () => {
      const data = await getTickets()
      setTickets(data)
      setFilteredTickets(data)
    }
    loadTickets()
  }, [])

  useEffect(() => {
    let filtered = tickets.filter(ticket => ticket.status === 'available')
    
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === selectedCategory)
    }
    
    // Sıralama
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        case 'date-desc':
          return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        default:
          return 0
      }
    })
    
    setFilteredTickets(filtered)
  }, [searchTerm, selectedCategory, tickets, sortBy])

  const categories = ['all', 'konser', 'tiyatro', 'spor', 'festival', 'diger']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-6">
          🎫 Bilet Devret ve Sat Platformu
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Gidemeyeceğiniz Biletlerinizi Satın veya Devredin
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Başka platformlardan aldığınız biletleri gidemeyeceğiniz için satmak veya devretmek mi istiyorsunuz? 
          Burada güvenle paylaşabilirsiniz.
        </p>
        <Link
          href="/bilet-ekle"
          className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
        >
          Bilet Ekle
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Etkinlik veya şehir ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="date-asc">Tarihe Göre (Yakın)</option>
              <option value="date-desc">Tarihe Göre (Uzak)</option>
              <option value="price-asc">Fiyata Göre (Düşük)</option>
              <option value="price-desc">Fiyata Göre (Yüksek)</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Filter className="text-gray-400 h-5 w-5 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'Tümü' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {filteredTickets.length > 0 && (
        <div className="mb-8 text-center">
          <p className="text-gray-600">
            <span className="font-semibold text-primary-600">{filteredTickets.length}</span> bilet bulundu
          </p>
        </div>
      )}

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎫</div>
          <p className="text-gray-500 text-lg mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Aradığınız kriterlere uygun bilet bulunamadı.' 
              : 'Henüz bilet eklenmemiş.'}
          </p>
          <Link
            href="/bilet-ekle"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition shadow-md"
          >
            İlk Bileti Ekleyin
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => {
            const discount = ticket.originalPrice > ticket.price 
              ? ((ticket.originalPrice - ticket.price) / ticket.originalPrice * 100).toFixed(0)
              : 0
            
            return (
              <Link
                key={ticket.id}
                href={`/bilet/${ticket.id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold uppercase">
                      {ticket.category}
                    </span>
                    {discount > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                        %{discount} İndirim
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition line-clamp-2">
                    {ticket.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {ticket.description}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                      <span>{new Date(ticket.eventDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary-600" />
                      <span className="line-clamp-1">{ticket.location}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">
                        ₺{ticket.price.toLocaleString()}
                      </span>
                      {ticket.originalPrice > ticket.price && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          ₺{ticket.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-primary-600 font-medium text-sm group-hover:translate-x-1 transition">
                      Detay →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

