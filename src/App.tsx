import { Routes, Route } from 'react-router-dom'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import TripsList from '@/pages/trips/TripsList'
import TripForm from '@/pages/trips/TripForm'
import TripView from '@/pages/trips/TripView'
import BranchesList from '@/pages/branches/BranchesList'
import BranchForm from '@/pages/branches/BranchForm'
import TestimonialsList from '@/pages/testimonials/TestimonialsList'
import TestimonialForm from '@/pages/testimonials/TestimonialForm'
import FaqsList from '@/pages/faqs/FaqsList'
import LeadsList from '@/pages/leads/LeadsList'
import LeadForm from '@/pages/leads/LeadForm'
import LeadView from '@/pages/leads/LeadView'
import SettingsPage from '@/pages/settings/SettingsPage'
import QrCodePage from '@/pages/qr-codes/QrCodePage'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />

        <Route path="/trips" element={<TripsList />} />
        <Route path="/trips/new" element={<TripForm />} />
        <Route path="/trips/:id" element={<TripView />} />
        <Route path="/trips/:id/edit" element={<TripForm />} />

        <Route path="/branches" element={<BranchesList />} />
        <Route path="/branches/new" element={<BranchForm />} />
        <Route path="/branches/:id/edit" element={<BranchForm />} />

        <Route path="/testimonials" element={<TestimonialsList />} />
        <Route path="/testimonials/new" element={<TestimonialForm />} />
        <Route path="/testimonials/:id/edit" element={<TestimonialForm />} />

        <Route path="/faqs" element={<FaqsList />} />

        <Route path="/leads" element={<LeadsList />} />
        <Route path="/leads/new" element={<LeadForm />} />
        <Route path="/leads/:id" element={<LeadView />} />

        <Route path="/settings" element={<SettingsPage />} />

        <Route path="/qr-codes" element={<QrCodePage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
