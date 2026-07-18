import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

const locationSchema = z
  .object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  })
  .optional()

export const tripSchema = z.object({
  title: z.string().min(2, 'العنوان مطلوب'),
  category: z.enum(['hajj', 'umrah', 'flights', 'domestic', 'international', 'visa'], {
    errorMap: () => ({ message: 'اختر الفئة' }),
  }),
  price: z.coerce.number().min(0, 'السعر يجب أن يكون رقمًا موجبًا'),
  currency: z.string().min(1, 'العملة مطلوبة'),
  duration: z.string().min(1, 'المدة مطلوبة'),
  hotelInfo: z.string().optional().default(''),
  includes: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  location: locationSchema,
  description: z.string().min(1, 'الوصف مطلوب'),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
})
export type TripFormValues = z.infer<typeof tripSchema>

export const branchSchema = z.object({
  name: z.string().min(2, 'اسم الفرع مطلوب'),
  address: z.string().min(2, 'العنوان مطلوب'),
  phone: z.string().min(3, 'رقم الهاتف مطلوب'),
  location: z.object({
    lat: z.number({ invalid_type_error: 'حدد الموقع على الخريطة' }),
    lng: z.number({ invalid_type_error: 'حدد الموقع على الخريطة' }),
  }),
  googleRating: z.coerce.number().min(0).max(5),
  mapLink: z.string().url('رابط غير صالح').or(z.literal('')).default(''),
})
export type BranchFormValues = z.infer<typeof branchSchema>

export const testimonialSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  text: z.string().min(2, 'النص مطلوب'),
  rating: z.coerce.number().min(1).max(5),
  source: z.enum(['facebook', 'google', 'other']),
  avatar: z.string().optional().default(''),
})
export type TestimonialFormValues = z.infer<typeof testimonialSchema>

export const faqSchema = z.object({
  question: z.string().min(2, 'السؤال مطلوب'),
  answer: z.string().min(2, 'الإجابة مطلوبة'),
})
export type FaqFormValues = z.infer<typeof faqSchema>

export const settingsSchema = z.object({
  hero: z.object({
    title: z.string().min(1, 'العنوان مطلوب'),
    subtitle: z.string().optional().default(''),
    images: z.array(z.string()).default([]),
  }),
  phones: z.array(z.string()).default([]),
  whatsappNumbers: z.array(z.string()).default([]),
  socialLinks: z.object({
    facebook: z.string().optional().default(''),
    instagram: z.string().optional().default(''),
    youtube: z.string().optional().default(''),
    tiktok: z.string().optional().default(''),
  }),
  stats: z.object({
    years: z.coerce.number().min(0),
    clients: z.coerce.number().min(0),
    branchesCount: z.coerce.number().min(0),
    googleRating: z.coerce.number().min(0).max(5),
  }),
  about: z.string().optional().default(''),
})
export type SettingsFormValues = z.infer<typeof settingsSchema>
