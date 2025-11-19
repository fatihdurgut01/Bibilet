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
  },
]

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
}

export async function getTickets(): Promise<Ticket[]> {
  // Simüle edilmiş API çağrısı
  await new Promise(resolve => setTimeout(resolve, 100))
  return tickets.filter(t => t.status === 'available')
}

export async function getTicketById(id: string): Promise<Ticket> {
  await new Promise(resolve => setTimeout(resolve, 100))
  const ticket = tickets.find(t => t.id === id)
  if (!ticket) {
    throw new Error('Bilet bulunamadı')
  }
  return ticket
}

export async function createTicket(data: Omit<Ticket, 'id' | 'createdAt' | 'status'>): Promise<Ticket> {
  await new Promise(resolve => setTimeout(resolve, 300))
  const newTicket: Ticket = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    status: 'available',
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

