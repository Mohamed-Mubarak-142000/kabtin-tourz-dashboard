export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PaginatedData<T> = {
  items: T[]
  pagination: PaginationMeta
}

export type TripCategory =
  | 'hajj'
  | 'umrah'
  | 'flights'
  | 'domestic'
  | 'international'
  | 'visa'

export type TripType = 'religious' | 'tourism'

export type Location = {
  lat: number
  lng: number
  address?: string
}

export type Trip = {
  _id: string
  title: string
  slug: string
  category: TripCategory
  tripType: TripType
  price: number
  currency: string
  duration: string
  hotelInfo: string
  includes: string[]
  images: string[]
  location?: Location
  description: string
  published: boolean
}

export type TripInput = Omit<Trip, '_id' | 'slug'> & { slug?: string }

export type BranchLocation = {
  lat: number
  lng: number
}

export type Branch = {
  _id: string
  name: string
  address: string
  phone: string
  location: BranchLocation
  googleRating: number
  mapLink: string
}

export type BranchInput = Omit<Branch, '_id'>

export type TestimonialSource = 'facebook' | 'google' | 'other'

export type Testimonial = {
  _id: string
  name: string
  text: string
  rating: number
  source: TestimonialSource
  avatar: string
}

export type TestimonialInput = Omit<Testimonial, '_id'>

export type Faq = {
  _id: string
  question: string
  answer: string
  order: number
}

export type FaqInput = Omit<Faq, '_id'>

export type LeadStatus = 'new' | 'contacted' | 'confirmed' | 'payment_pending' | 'paid' | 'cancelled' | 'closed'

export type Lead = {
  _id: string
  name: string
  whatsapp: string
  phone?: string
  email?: string
  nationality: string
  identityNumber: string
  trip: string
  tripTitle: string
  unitPrice: number
  totalPrice: number
  currency: string
  serviceCategory: string
  branch: string
  guests: number
  roomType: string
  paymentMethod: 'cash' | 'bank_transfer' | 'instapay' | 'vodafone_cash'
  paymentProof?: string
  message: string
  status: LeadStatus
  createdAt: string
}

export type LeadInput = {
  name: string
  whatsapp: string
  phone?: string
  email?: string
  nationality: string
  identityNumber: string
  tripId: string
  branch?: string
  guests: number
  roomType: string
  paymentMethod: 'cash' | 'bank_transfer' | 'instapay' | 'vodafone_cash'
  paymentProof?: string
  message?: string
}

export type SocialLinks = {
  facebook: string
  instagram: string
  youtube: string
  tiktok: string
}

export type Stats = {
  years: number
  clients: number
  branchesCount: number
  googleRating: number
}

export type QrCode = {
  _id: string
  targetUrl: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export type Settings = {
  hero: {
    title: string
    subtitle: string
    images: string[]
  }
  phones: string[]
  whatsappNumbers: string[]
  socialLinks: SocialLinks
  stats: Stats
  about: string
}
