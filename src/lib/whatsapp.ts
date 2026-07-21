export function normalizeEgyptNumber(n: string) {
  return n.replace(/^0/, '').replace(/\D/g, '')
}

export function buildWhatsAppUrl(n: string | undefined, text?: string) {
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  if (!n) return `https://wa.me/${query}`
  return `https://wa.me/20${normalizeEgyptNumber(n)}${query}`
}
