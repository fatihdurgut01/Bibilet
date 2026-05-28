import { supabase } from './supabase'

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

export interface OfferWithTicket extends Offer {
  ticketTitle: string
}

export interface Rating {
  sellerId: string
  raterId: string
  score: number
}

// DB satırı (snake_case) → uygulama nesnesi (camelCase)
function mapTicket(row: Record<string, unknown>): Ticket {
  return {
    id:            row.id as string,
    title:         row.title as string,
    description:   row.description as string,
    eventDate:     row.event_date as string,
    location:      row.location as string,
    price:         row.price as number,
    originalPrice: row.original_price as number,
    category:      row.category as string,
    contact:       row.contact as string,
    createdAt:     row.created_at as string,
    status:        row.status as 'available' | 'sold',
    ownerId:       row.owner_id as string,
    currency:      row.currency as string,
    imageUrl:      (row.image_url as string) || undefined,
  }
}

function mapOffer(row: Record<string, unknown>): Offer {
  return {
    id:        row.id as string,
    ticketId:  row.ticket_id as string,
    userId:    row.user_id as string,
    amount:    row.amount as number,
    createdAt: row.created_at as string,
  }
}

function mapRating(row: Record<string, unknown>): Rating {
  return {
    sellerId: row.seller_id as string,
    raterId:  row.rater_id as string,
    score:    row.score as number,
  }
}

// ============================================================
// TICKETS
// ============================================================

export async function getTickets(): Promise<Ticket[]> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('status', 'available')
    .gt('event_date', now)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapTicket)
}

export async function getTicketsByOwner(ownerId: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapTicket)
}

export async function getTicketById(id: string): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) throw new Error('Bilet bulunamadı')
  return mapTicket(data)
}

export async function createTicket(
  ticketData: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'ownerId'>,
  ownerId: string
): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      title:          ticketData.title,
      description:    ticketData.description,
      event_date:     ticketData.eventDate,
      location:       ticketData.location,
      price:          ticketData.price,
      original_price: ticketData.originalPrice,
      category:       ticketData.category,
      contact:        ticketData.contact,
      currency:       ticketData.currency,
      image_url:      ticketData.imageUrl || null,
      owner_id:       ownerId,
      status:         'available',
    })
    .select()
    .single()

  if (error || !data) throw error ?? new Error('Bilet oluşturulamadı')
  return mapTicket(data)
}

export async function markTicketAsSold(id: string): Promise<void> {
  const { error } = await supabase
    .from('tickets')
    .update({ status: 'sold' })
    .eq('id', id)

  if (error) throw error
}

export async function updateTicket(
  id: string,
  ticketData: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'ownerId'>
): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .update({
      title:          ticketData.title,
      description:    ticketData.description,
      event_date:     ticketData.eventDate,
      location:       ticketData.location,
      price:          ticketData.price,
      original_price: ticketData.originalPrice,
      category:       ticketData.category,
      contact:        ticketData.contact,
      currency:       ticketData.currency,
      image_url:      ticketData.imageUrl || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw error ?? new Error('Bilet güncellenemedi')
  return mapTicket(data)
}

// ============================================================
// OFFERS
// ============================================================

export async function createOffer(
  ticketId: string,
  userId: string,
  amount: number
): Promise<Offer> {
  const { data, error } = await supabase
    .from('offers')
    .insert({ ticket_id: ticketId, user_id: userId, amount })
    .select()
    .single()

  if (error || !data) throw error ?? new Error('Teklif gönderilemedi')
  return mapOffer(data)
}

export async function getOffersByUser(userId: string): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapOffer)
}

export async function getOffersForSeller(sellerId: string): Promise<OfferWithTicket[]> {
  const { data: ticketRows, error: ticketError } = await supabase
    .from('tickets')
    .select('id')
    .eq('owner_id', sellerId)

  if (ticketError) throw ticketError
  const ids = (ticketRows ?? []).map((t) => t.id as string)
  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('offers')
    .select('*, ticket:tickets(title)')
    .in('ticket_id', ids)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(row => ({
    id:          row.id as string,
    ticketId:    row.ticket_id as string,
    userId:      row.user_id as string,
    amount:      row.amount as number,
    createdAt:   row.created_at as string,
    ticketTitle: (row.ticket as Record<string, unknown>)?.title as string ?? 'Bilinmeyen Bilet',
  }))
}

// ============================================================
// RATINGS
// ============================================================

export async function addRating(
  sellerId: string,
  raterId: string,
  score: number
): Promise<Rating> {
  // Upsert: aynı (seller_id, rater_id) çifti varsa günceller, yoksa ekler
  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      { seller_id: sellerId, rater_id: raterId, score },
      { onConflict: 'seller_id,rater_id' }
    )
    .select()
    .single()

  if (error || !data) throw error ?? new Error('Puanlama kaydedilemedi')
  return mapRating(data)
}

export async function getRatingsForSeller(sellerId: string): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('seller_id', sellerId)

  if (error) throw error
  return (data ?? []).map(mapRating)
}

// ============================================================
// WANTED TICKETS
// ============================================================

export interface WantedTicket {
  id: string
  userId: string
  title: string
  category: string
  location: string
  maxPrice: number
  description?: string
  status: 'active' | 'fulfilled'
  createdAt: string
}

function mapWantedTicket(row: Record<string, unknown>): WantedTicket {
  return {
    id:          row.id as string,
    userId:      row.user_id as string,
    title:       row.title as string,
    category:    row.category as string,
    location:    row.location as string,
    maxPrice:    row.max_price as number,
    description: row.description as string | undefined,
    status:      row.status as 'active' | 'fulfilled',
    createdAt:   row.created_at as string,
  }
}

export async function getWantedTickets(): Promise<WantedTicket[]> {
  const { data, error } = await supabase
    .from('wanted_tickets')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapWantedTicket)
}

export async function getWantedTicketsByUser(userId: string): Promise<WantedTicket[]> {
  const { data, error } = await supabase
    .from('wanted_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapWantedTicket)
}

export async function createWantedTicket(
  wantedData: Omit<WantedTicket, 'id' | 'createdAt' | 'status' | 'userId'>,
  userId: string
): Promise<WantedTicket> {
  const { data, error } = await supabase
    .from('wanted_tickets')
    .insert({
      user_id:     userId,
      title:       wantedData.title,
      category:    wantedData.category,
      location:    wantedData.location,
      max_price:   wantedData.maxPrice,
      description: wantedData.description || null,
      status:      'active',
    })
    .select()
    .single()

  if (error || !data) throw error ?? new Error('İlan oluşturulamadı')
  return mapWantedTicket(data)
}

export async function markWantedTicketFulfilled(id: string): Promise<void> {
  const { error } = await supabase
    .from('wanted_tickets')
    .update({ status: 'fulfilled' })
    .eq('id', id)

  if (error) throw error
}
