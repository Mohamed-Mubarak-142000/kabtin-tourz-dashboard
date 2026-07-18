export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export type TripCategory =
  | 'hajj'
  | 'umrah'
  | 'flights'
  | 'domestic'
  | 'international'
  | 'visa'

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
  price: number
  currency: string
  duration: string
  hotelInfo: string
  includes: string[]
  images: string[]
  location?: Location
  description: string
  featured: boolean
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

export type LeadStatus = 'new' | 'contacted' | 'closed'

export type Lead = {
  _id: string
  name: string
  whatsapp: string
  serviceCategory: string
  branch: string
  guests: number
  roomType: string
  message: string
  status: LeadStatus
  createdAt: string
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
