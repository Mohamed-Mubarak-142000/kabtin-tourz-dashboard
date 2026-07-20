import type { TripCategory, TripType, TestimonialSource, LeadStatus } from '@/types'

export const tripTypeLabels: Record<TripType, string> = {
  religious: 'رحلة دينية',
  tourism: 'رحلة سياحية',
}

export const tripTypeOptions = Object.entries(tripTypeLabels).map(([value, label]) => ({
  value: value as TripType,
  label,
}))

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
  confirmed: 'مؤكد',
  payment_pending: 'بانتظار الدفع',
  paid: 'تم الدفع',
  cancelled: 'ملغي',
  closed: 'مغلق (قديم)',
}

export const leadStatusOptions = Object.entries(leadStatusLabels).map(([value, label]) => ({
  value: value as LeadStatus,
  label,
}))

export const currencyOptions = ['EGP', 'USD', 'SAR']
