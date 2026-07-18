import { api } from './api'
import type {
  ApiResponse,
  Branch,
  BranchInput,
  Faq,
  FaqInput,
  Lead,
  LeadStatus,
  Settings,
  Testimonial,
  TestimonialInput,
  Trip,
  TripInput,
} from '@/types'

// ---- Auth ----
export async function login(username: string, password: string) {
  const res = await api.post<ApiResponse<{ token: string }>>('/auth/login', {
    username,
    password,
  })
  return res.data
}

// ---- Trips ----
export async function getTrips(category?: string) {
  const res = await api.get<ApiResponse<Trip[]>>('/trips', {
    params: category ? { category } : undefined,
  })
  return res.data
}

export async function getTrip(slug: string) {
  const res = await api.get<ApiResponse<Trip>>(`/trips/${slug}`)
  return res.data
}

export async function createTrip(payload: TripInput) {
  const res = await api.post<ApiResponse<Trip>>('/trips', payload)
  return res.data
}

export async function updateTrip(id: string, payload: TripInput) {
  const res = await api.put<ApiResponse<Trip>>(`/trips/${id}`, payload)
  return res.data
}

export async function deleteTrip(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/trips/${id}`)
  return res.data
}

// ---- Branches ----
export async function getBranches() {
  const res = await api.get<ApiResponse<Branch[]>>('/branches')
  return res.data
}

export async function createBranch(payload: BranchInput) {
  const res = await api.post<ApiResponse<Branch>>('/branches', payload)
  return res.data
}

export async function updateBranch(id: string, payload: BranchInput) {
  const res = await api.put<ApiResponse<Branch>>(`/branches/${id}`, payload)
  return res.data
}

export async function deleteBranch(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/branches/${id}`)
  return res.data
}

// ---- Testimonials ----
export async function getTestimonials() {
  const res = await api.get<ApiResponse<Testimonial[]>>('/testimonials')
  return res.data
}

export async function createTestimonial(payload: TestimonialInput) {
  const res = await api.post<ApiResponse<Testimonial>>('/testimonials', payload)
  return res.data
}

export async function updateTestimonial(id: string, payload: TestimonialInput) {
  const res = await api.put<ApiResponse<Testimonial>>(`/testimonials/${id}`, payload)
  return res.data
}

export async function deleteTestimonial(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/testimonials/${id}`)
  return res.data
}

// ---- FAQs ----
export async function getFaqs() {
  const res = await api.get<ApiResponse<Faq[]>>('/faqs')
  return res.data
}

export async function createFaq(payload: FaqInput) {
  const res = await api.post<ApiResponse<Faq>>('/faqs', payload)
  return res.data
}

export async function updateFaq(id: string, payload: FaqInput) {
  const res = await api.put<ApiResponse<Faq>>(`/faqs/${id}`, payload)
  return res.data
}

export async function deleteFaq(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/faqs/${id}`)
  return res.data
}

export async function reorderFaqs(order: { id: string; order: number }[]) {
  const res = await api.patch<ApiResponse<null>>('/faqs/reorder', order)
  return res.data
}

// ---- Leads ----
export async function getLeads() {
  const res = await api.get<ApiResponse<Lead[]>>('/leads')
  return res.data
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const res = await api.patch<ApiResponse<Lead>>(`/leads/${id}`, { status })
  return res.data
}

export async function deleteLead(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/leads/${id}`)
  return res.data
}

// ---- Settings ----
export async function getSettings() {
  const res = await api.get<ApiResponse<Settings>>('/settings')
  return res.data
}

export async function updateSettings(payload: Settings) {
  const res = await api.put<ApiResponse<Settings>>('/settings', payload)
  return res.data
}

// ---- Upload ----
export async function uploadImages(files: File[]) {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  const res = await api.post<ApiResponse<{ urls: string[] }>>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
