import type { TripCategory, TestimonialSource, LeadStatus } from '@/types'

export const categoryLabels: Record<TripCategory, string> = {
  hajj: 'حج',
  umrah: 'عمرة',
  flights: 'طيران',
  domestic: 'رحلات داخلية',
  international: 'رحلات خارجية',
  visa: 'تأشيرات',
}

export const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({
  value: value as TripCategory,
  label,
}))

export const sourceLabels: Record<TestimonialSource, string> = {
  facebook: 'فيسبوك',
  google: 'جوجل',
  other: 'أخرى',
}

export const sourceOptions = Object.entries(sourceLabels).map(([value, label]) => ({
  value: value as TestimonialSource,
  label,
}))

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: 'جديد',
  contacted: 'تم التواصل',
  closed: 'مغلق',
}

export const leadStatusOptions = Object.entries(leadStatusLabels).map(([value, label]) => ({
  value: value as LeadStatus,
  label,
}))

export const currencyOptions = ['EGP', 'USD', 'SAR']
