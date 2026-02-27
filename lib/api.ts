// Basit bir in-memory veri deposu (gerçek uygulamada veritabanı kullanılmalı)
let tickets: any[] = [
  {
    id: '1',
    title: 'Tarkan Konseri',
    description: 'VIP bölüm biletim var ancak gidemeyeceğim. Bilet dijital olarak gönderilecek.',
    eventDate: '2024-12-25T20:00:00',
    location: 'İstanbul, Zorlu Center',
    price: 800,
    originalPrice: 1200,
    category: 'konser',
    contact: '0532 123 45 67',
    createdAt: new Date().toISOString(),
    status: 'available',
    ownerId: 'owner-1',
    currency: 'TRY',
    imageUrl: '',
  },
  {
    id: '2',
    title: 'Galatasaray - Fenerbahçe Derbisi',
    description: 'Tribün biletim var, maça gidemeyeceğim. Bilet transfer edilebilir.',
    eventDate: '2024-12-20T19:00:00',
    location: 'İstanbul, Nef Stadyumu',
    price: 500,
    originalPrice: 600,
    category: 'spor',
    contact: 'example@email.com',
    createdAt: new Date().toISOString(),
    status: 'available',
    ownerId: 'owner-2',
    currency: 'TRY',
    imageUrl: '',
  },
]

// teklifler ve puanlar için basit in-memory depolar
let offers: {
  id: string
  ticketId: string
  userId: string
  amount: number
  createdAt: string
}[] = []

let ratings: {
  sellerId: string
  raterId: string
  score: number
}[] = []

export interface Ticket {
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

export interface Offer {
  id: string
  ticketId: string
  userId: string
  amount: number
  createdAt: string
}

export interface Rating {
  sellerId: string
  raterId: string
  score: number
}

export async function getTickets(): Promise<Ticket[]> {
  // Simüle edilmiş API çağrısı
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Tarihi geçen biletleri otomatik olarak sil
  const now = new Date()
  tickets = tickets.filter(ticket => {
    const eventDate = new Date(ticket.eventDate)
    return eventDate > now || ticket.status === 'sold'
  })
  
  return tickets.filter(t => t.status === 'available')
}

export async function getTicketsByOwner(ownerId: string): Promise<Ticket[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return tickets.filter(t => t.ownerId === ownerId)
}

export async function createOffer(ticketId: string, userId: string, amount: number): Promise<Offer> {
  await new Promise(resolve => setTimeout(resolve, 200))
  const newOffer: Offer = {
    id: Date.now().toString(),
    ticketId,
    userId,
    amount,
    createdAt: new Date().toISOString(),
  }
  offers.push(newOffer)
  return newOffer
}

export async function getOffersByUser(userId: string): Promise<Offer[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return offers.filter(o => o.userId === userId)
}

export async function getOffersForSeller(sellerId: string): Promise<Offer[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  // offers on tickets owned by seller
  const sellerTickets = tickets.filter(t => t.ownerId === sellerId).map(t => t.id)
  return offers.filter(o => sellerTickets.includes(o.ticketId))
}

export async function addRating(sellerId: string, raterId: string, score: number): Promise<Rating> {
  await new Promise(resolve => setTimeout(resolve, 100))
  const newRating: Rating = { sellerId, raterId, score }
  ratings.push(newRating)
  return newRating
}

export async function getRatingsForSeller(sellerId: string): Promise<Rating[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return ratings.filter(r => r.sellerId === sellerId)
}

export async function getTicketById(id: string): Promise<Ticket> {
  await new Promise(resolve => setTimeout(resolve, 100))
  const ticket = tickets.find(t => t.id === id)
  if (!ticket) {
    throw new Error('Bilet bulunamadı')
  }
  return ticket
}

export async function createTicket(
  data: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'ownerId'>,
  ownerId: string
): Promise<Ticket> {
  await new Promise(resolve => setTimeout(resolve, 300))
  const newTicket: Ticket = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    status: 'available',
    ownerId,
  }
  tickets.push(newTicket)
  return newTicket
}

export async function markTicketAsSold(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200))
  const ticket = tickets.find(t => t.id === id)
  if (ticket) {
    ticket.status = 'sold'
  }
}

