'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Search, Filter, ArrowUpDown } from 'lucide-react'
import { getTickets, getWantedTickets, WantedTicket } from '@/lib/api'
import { formatDate, formatShortDate, formatPrice } from '@/lib/format'

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
  currency: string
  imageUrl?: string
}

type SortOption = 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc'
type Tab = 'biletler' | 'arananlar'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('biletler')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [wantedTickets, setWantedTickets] = useState<WantedTicket[]>([])
  const [filteredWanted, setFilteredWanted] = useState<WantedTicket[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-asc')

  useEffect(() => {
    const load = async () => {
      const [ticketData, wantedData] = await Promise.all([getTickets(), getWantedTickets()])
      setTickets(ticketData)
      setFilteredTickets(ticketData)
      setWantedTickets(wantedData)
      setFilteredWanted(wantedData)
    }
    load()
  }, [])

  // Bilet filtreleme
  useEffect(() => {
    let f = [...tickets]
    if (searchTerm) {
      f = f.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedCategory !== 'all') {
      f = f.filter(t => t.category === selectedCategory)
    }
    f = [...f].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':  return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        case 'date-desc': return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        case 'price-asc': return a.price - b.price
        case 'price-desc': return b.price - a.price
        default: return 0
      }
    })
    setFilteredTickets(f)
  }, [searchTerm, selectedCategory, tickets, sortBy])

  // Arananlar filtreleme
  useEffect(() => {
    let f = [...wantedTickets]
    if (searchTerm) {
      f = f.filter(w =>
        w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedCategory !== 'all') {
      f = f.filter(w => w.category === selectedCategory)
    }
    setFilteredWanted(f)
  }, [searchTerm, selectedCategory, wantedTickets])

  // Bir bilet için kaç kişi arıyor?
  const wantedCountFor = (ticketTitle: string) =>
    wantedTickets.filter(w =>
      w.title.toLowerCase().includes(ticketTitle.toLowerCase()) ||
      ticketTitle.toLowerCase().includes(w.title.toLowerCase())
    ).length

  const categories = ['all', 'konser', 'tiyatro', 'spor', 'festival', 'diger']
  const categoryLabel = (cat: string) => cat === 'all' ? 'Tümü' : cat.charAt(0).toUpperCase() + cat.slice(1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-6">
          🎫 Bilet Devret ve Sat Platformu
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Gidemeyeceğiniz Biletlerinizi Satın veya Devredin
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Biletinizi satmak veya bilet aramak için doğru adres.
        </p>
        <div className="flex justify-center gap-3 mb-8">
          <Link href="/bilet-ekle"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg">
            🎟 Bilet Sat
          </Link>
          <Link href="/bilet-ara"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg">
            🔍 Bilet Ara
          </Link>
        </div>

        {/* Güven maddeleri */}
        <div className="flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 shadow-sm">
            🛡️ Fiyatlar orijinal fiyatın %110'unu geçemez
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 shadow-sm">
            ✅ Doğrulanmış kullanıcılar
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 shadow-sm">
            🇹🇷 Türkiye'nin bilet devir platformu
          </span>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 max-w-sm">
        <button
          onClick={() => setActiveTab('biletler')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition ${
            activeTab === 'biletler'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🎫 Satılık Biletler
          {tickets.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
              {tickets.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('arananlar')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition ${
            activeTab === 'arananlar'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🔍 Arananlar
          {wantedTickets.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
              {wantedTickets.length}
            </span>
          )}
        </button>
      </div>

      {/* Arama + Filtreler */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Etkinlik veya şehir ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          {activeTab === 'biletler' && (
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="date-asc">Tarihe Göre (Yakın)</option>
                <option value="date-desc">Tarihe Göre (Uzak)</option>
                <option value="price-asc">Fiyata Göre (Düşük)</option>
                <option value="price-desc">Fiyata Göre (Yüksek)</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Filter className="text-gray-400 h-5 w-5 flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* ===== SATIŞA ÇIKARILAN BİLETLER ===== */}
      {activeTab === 'biletler' && (
        <>
          {filteredTickets.length > 0 && (
            <p className="text-gray-600 mb-6 text-center">
              <span className="font-semibold text-primary-600">{filteredTickets.length}</span> bilet bulundu
            </p>
          )}
          {filteredTickets.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎫</div>
              <p className="text-gray-500 text-lg mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Aradığınız kriterlere uygun bilet bulunamadı.'
                  : 'Henüz bilet eklenmemiş.'}
              </p>
              <Link href="/bilet-ekle"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition shadow-md">
                İlk Bileti Ekleyin
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTickets.map(ticket => {
                const discountPercent = ticket.originalPrice > ticket.price
                  ? Math.round((ticket.originalPrice - ticket.price) / ticket.originalPrice * 100)
                  : 0
                const wantedCount = wantedCountFor(ticket.title)

                return (
                  <Link key={ticket.id} href={`/bilet/${ticket.id}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
                    {ticket.imageUrl && (
                      <div className="h-40 w-full overflow-hidden">
                        <img src={ticket.imageUrl} alt={ticket.title} className="object-cover h-full w-full" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold uppercase">
                          {ticket.category}
                        </span>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          {wantedCount > 0 && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold">
                              🔍 {wantedCount} kişi arıyor
                            </span>
                          )}
                          {discountPercent > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              %{discountPercent} İndirim
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition line-clamp-2">
                        {ticket.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ticket.description}</p>
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                          <span>{formatDate(ticket.eventDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary-600" />
                          <span className="line-clamp-1">{ticket.location}</span>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-primary-600">
                            {formatPrice(ticket.price, ticket.currency)}
                          </span>
                          {ticket.originalPrice > ticket.price && (
                            <span className="text-sm text-gray-400 line-through ml-2">
                              {formatPrice(ticket.originalPrice, ticket.currency)}
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
        </>
      )}

      {/* ===== ARANANLAR ===== */}
      {activeTab === 'arananlar' && (
        <>
          {filteredWanted.length > 0 && (
            <p className="text-gray-600 mb-6 text-center">
              <span className="font-semibold text-blue-600">{filteredWanted.length}</span> kişi bilet arıyor
            </p>
          )}
          {filteredWanted.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Kriterlere uygun arama ilanı bulunamadı.'
                  : 'Henüz bilet arama ilanı eklenmemiş.'}
              </p>
              <Link href="/bilet-ara"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-md">
                İlk Arama İlanını Siz Açın
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWanted.map(w => (
                <div key={w.id}
                  className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-600" />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase">
                        {w.category}
                      </span>
                      <span className="text-xs text-gray-400">{formatShortDate(w.createdAt)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{w.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{w.location}</span>
                    </div>
                    {w.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{w.description}</p>
                    )}
                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Max ödeyeceği</p>
                        <span className="text-xl font-bold text-blue-600">
                          ₺{Number(w.maxPrice).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <Link href="/bilet-ekle"
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                        Bilet Sat →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
