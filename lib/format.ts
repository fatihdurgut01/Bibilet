export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Tarih belirtilmedi'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'Tarih belirtilmedi'
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('tr-TR')
}

export function formatPrice(amount: number, currency: string): string {
  const formatted = amount.toLocaleString('tr-TR')
  switch (currency) {
    case 'USD': return `$${formatted}`
    case 'EUR': return `€${formatted}`
    default:    return `₺${formatted}`
  }
}
