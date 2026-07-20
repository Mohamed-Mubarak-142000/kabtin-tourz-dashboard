import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Chip } from '@nextui-org/react'
import {
  HiOutlineCash,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineInboxIn,
  HiOutlineMap,
  HiOutlineOfficeBuilding,
  HiOutlineStar,
} from 'react-icons/hi'
import StatCard from '@/components/common/StatCard'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { getBranches, getLeads, getTestimonials, getTrips } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { categoryLabels, leadStatusLabels } from '@/lib/constants'
import { staggerContainerVariant, staggerItemVariant } from '@/lib/animationVariants'
import type { Lead, LeadStatus, Testimonial, Trip, TripCategory } from '@/types'

const statusColors: Record<LeadStatus, 'primary' | 'warning' | 'success' | 'secondary' | 'danger' | 'default'> = {
  new: 'warning', contacted: 'primary', confirmed: 'secondary', payment_pending: 'warning',
  paid: 'success', cancelled: 'danger', closed: 'default',
}

const chartColors = ['#163B76', '#F4791A', '#16a34a', '#8b5cf6', '#0ea5e9', '#eab308']

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [branchesCount, setBranchesCount] = useState(0)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [tripsRes, branchesRes, leadsRes, testimonialsRes] = await Promise.all([
        getTrips(), getBranches(), getLeads(), getTestimonials(),
      ])
      setTrips(tripsRes.data ?? [])
      setBranchesCount(branchesRes.data?.length ?? 0)
      setLeads(leadsRes.data ?? [])
      setTestimonials(testimonialsRes.data ?? [])
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const analytics = useMemo(() => {
    const activeLeads = leads.filter((lead) => lead.status !== 'cancelled')
    const expectedRevenue = activeLeads.reduce((sum, lead) => sum + (lead.totalPrice || 0), 0)
    const paidRevenue = leads.filter((lead) => lead.status === 'paid').reduce((sum, lead) => sum + (lead.totalPrice || 0), 0)
    const averageRating = testimonials.length
      ? testimonials.reduce((sum, item) => sum + (item.rating || 0), 0) / testimonials.length
      : 0
    const recentLeads = [...leads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5)
    const statusData = (Object.keys(leadStatusLabels) as LeadStatus[]).map((status) => ({
      status, label: leadStatusLabels[status], count: leads.filter((lead) => lead.status === status).length,
    })).filter((item) => item.count > 0)
    const categoryData = (Object.keys(categoryLabels) as TripCategory[]).map((category, index) => ({
      category, label: categoryLabels[category], count: trips.filter((trip) => trip.category === category).length,
      color: chartColors[index],
    })).filter((item) => item.count > 0)

    const now = new Date()
    const monthlyData = Array.from({ length: 6 }, (_, reverseIndex) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - reverseIndex), 1)
      const count = leads.filter((lead) => {
        const created = new Date(lead.createdAt)
        return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth()
      }).length
      return { label: date.toLocaleDateString('ar-EG', { month: 'short' }), count }
    })

    return { expectedRevenue, paidRevenue, averageRating, recentLeads, statusData, categoryData, monthlyData }
  }, [leads, testimonials, trips])

  return (
    <motion.div className="flex flex-col gap-6 pb-6" variants={staggerContainerVariant} initial="initial" animate="animate">
      <motion.div variants={staggerItemVariant} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="page-title">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">صورة واضحة ومباشرة لأداء الحجوزات ومحتوى الموقع</p>
        </div>
        <p className="text-xs text-stone-400">آخر تحديث: {new Date().toLocaleString('ar-EG')}</p>
      </motion.div>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <>
          <motion.div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" variants={staggerContainerVariant}>
            <motion.div variants={staggerItemVariant}><StatCard label="إجمالي الحجوزات" value={leads.length} icon={<HiOutlineInboxIn className="h-6 w-6" />} /></motion.div>
            <motion.div variants={staggerItemVariant}><StatCard label="طلبات تحتاج متابعة" value={leads.filter((lead) => lead.status === 'new').length} icon={<HiOutlineClock className="h-6 w-6" />} accent="secondary" /></motion.div>
            <motion.div variants={staggerItemVariant}><StatCard label="الإيراد المتوقع" value={`${analytics.expectedRevenue.toLocaleString('ar-EG')} EGP`} icon={<HiOutlineCash className="h-6 w-6" />} /></motion.div>
            <motion.div variants={staggerItemVariant}><StatCard label="متوسط التقييم" value={analytics.averageRating ? analytics.averageRating.toFixed(1) : '—'} icon={<HiOutlineStar className="h-6 w-6" />} accent="secondary" /></motion.div>
          </motion.div>

          <motion.div variants={staggerItemVariant} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="رحلات منشورة" value={trips.filter((trip) => trip.published).length} total={trips.length} icon={<HiOutlineMap />} />
            <MiniStat label="الفروع" value={branchesCount} icon={<HiOutlineOfficeBuilding />} />
            <MiniStat label="إيراد محصل" value={`${analytics.paidRevenue.toLocaleString('ar-EG')} EGP`} icon={<HiOutlineCash />} />
            <MiniStat label="آراء العملاء" value={testimonials.length} icon={<HiOutlineStar />} />
          </motion.div>

          <div className="grid gap-5 xl:grid-cols-2">
            <motion.section variants={staggerItemVariant} className="card p-5 sm:p-6">
              <CardTitle icon={<HiOutlineChartBar />} title="حالات طلبات الحجز" subtitle="توزيع الطلبات حسب مرحلة المتابعة" />
              <div className="mt-6 space-y-4">
                {analytics.statusData.length ? analytics.statusData.map((item) => (
                  <div key={item.status}>
                    <div className="mb-1.5 flex items-center justify-between text-sm"><span className="font-medium text-stone-700 dark:text-stone-200">{item.label}</span><span className="font-bold text-stone-900 dark:text-white">{item.count}</span></div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-stone-100 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-l from-primary-600 to-primary-400" style={{ width: `${Math.max(5, (item.count / Math.max(1, leads.length)) * 100)}%` }} /></div>
                  </div>
                )) : <EmptyChart />}
              </div>
            </motion.section>

            <motion.section variants={staggerItemVariant} className="card p-5 sm:p-6">
              <CardTitle icon={<HiOutlineMap />} title="توزيع الرحلات" subtitle="الرحلات المتاحة حسب نوع الخدمة" />
              {analytics.categoryData.length ? (
                <div className="mt-6 flex flex-col items-center gap-7 sm:flex-row">
                  <Donut data={analytics.categoryData} total={trips.length} />
                  <div className="grid flex-1 grid-cols-2 gap-3">
                    {analytics.categoryData.map((item) => <div key={item.category} className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} /><span className="text-stone-500 dark:text-stone-400">{item.label}</span><b className="ms-auto">{item.count}</b></div>)}
                  </div>
                </div>
              ) : <EmptyChart />}
            </motion.section>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.45fr_.55fr]">
            <motion.section variants={staggerItemVariant} className="card p-5 sm:p-6">
              <CardTitle icon={<HiOutlineChartBar />} title="نشاط الحجوزات" subtitle="عدد الطلبات خلال آخر 6 أشهر" />
              <MonthlyBars data={analytics.monthlyData} />
            </motion.section>

            <motion.section variants={staggerItemVariant} className="card p-5 sm:p-6">
              <CardTitle icon={<HiOutlineExclamation />} title="تحتاج انتباهك" subtitle="ملخص سريع للمهام الحالية" />
              <div className="mt-5 space-y-3">
                <AlertRow label="طلبات جديدة لم تُراجع" value={leads.filter((lead) => lead.status === 'new').length} to="/leads" tone="orange" />
                <AlertRow label="دفعات قيد الانتظار" value={leads.filter((lead) => lead.status === 'payment_pending').length} to="/leads" tone="blue" />
                <AlertRow label="رحلات غير منشورة" value={trips.filter((trip) => !trip.published).length} to="/trips" tone="red" />
              </div>
            </motion.section>
          </div>

          <motion.section variants={staggerItemVariant} className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 p-5 dark:border-white/10 sm:px-6">
              <div><h2 className="text-lg font-bold text-stone-900 dark:text-white">أحدث طلبات الحجز</h2><p className="text-xs text-stone-500 dark:text-stone-400">آخر الطلبات الواردة من الموقع</p></div>
              <Link to="/leads" className="text-sm font-bold text-secondary-600 hover:text-secondary-700">عرض الكل ←</Link>
            </div>
            {analytics.recentLeads.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-right text-sm">
                  <thead className="bg-stone-50 text-stone-500 dark:bg-white/5 dark:text-stone-400"><tr><th className="px-6 py-3 font-semibold">الاسم</th><th className="px-6 py-3 font-semibold">واتساب</th><th className="px-6 py-3 font-semibold">الرحلة</th><th className="px-6 py-3 font-semibold">الإجمالي</th><th className="px-6 py-3 font-semibold">الحالة</th><th className="px-6 py-3 font-semibold">التاريخ</th></tr></thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-white/5">
                    {analytics.recentLeads.map((lead) => (
                      <tr key={lead._id} className="text-stone-700 transition-colors hover:bg-primary-50/40 dark:text-stone-200 dark:hover:bg-white/5">
                        <td className="px-6 py-4 font-bold"><Link to={`/leads/${lead._id}`} className="hover:text-primary-600">{lead.name}</Link></td>
                        <td className="px-6 py-4" dir="ltr">{lead.whatsapp}</td>
                        <td className="max-w-[220px] truncate px-6 py-4">{lead.tripTitle ?? lead.serviceCategory}</td>
                        <td className="px-6 py-4 font-bold text-primary-600 dark:text-primary-300">{lead.totalPrice?.toLocaleString('ar-EG')} {lead.currency}</td>
                        <td className="px-6 py-4"><Chip size="sm" color={statusColors[lead.status]} variant="flat">{leadStatusLabels[lead.status]}</Chip></td>
                        <td className="px-6 py-4 text-stone-500 dark:text-stone-400">{new Date(lead.createdAt).toLocaleDateString('ar-EG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="py-12 text-center text-sm text-stone-400">لا توجد طلبات حجز بعد</p>}
          </motion.section>
        </>
      )}
    </motion.div>
  )
}

function MiniStat({ label, value, total, icon }: { label: string; value: string | number; total?: number; icon: React.ReactNode }) {
  return <div className="card flex items-center gap-3 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-primary-600 dark:bg-white/10 dark:text-primary-300">{icon}</span><div className="min-w-0"><p className="truncate text-xs text-stone-500 dark:text-stone-400">{label}</p><p className="mt-0.5 font-black text-stone-900 dark:text-white">{value}{total !== undefined && <span className="text-xs font-normal text-stone-400"> / {total}</span>}</p></div></div>
}

function CardTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return <div className="flex items-start gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-xl text-primary-600 dark:bg-primary-700/30 dark:text-primary-300">{icon}</span><div><h2 className="font-bold text-stone-900 dark:text-white">{title}</h2><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{subtitle}</p></div></div>
}

function Donut({ data, total }: { data: { count: number; color: string }[]; total: number }) {
  let current = 0
  const stops = data.map((item) => { const start = current; current += (item.count / total) * 100; return `${item.color} ${start}% ${current}%` }).join(', ')
  return <div className="relative h-40 w-40 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops})` }}><div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white shadow-inner dark:bg-primary-900"><span className="text-3xl font-black text-stone-900 dark:text-white">{total}</span><span className="text-xs text-stone-400">رحلة</span></div></div>
}

function MonthlyBars({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((item) => item.count))
  return <div className="mt-6 flex h-48 items-end justify-around gap-3 border-b border-stone-200 px-2 dark:border-white/10">{data.map((item) => <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-stone-600 dark:text-stone-300">{item.count}</span><div className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-primary-700 to-primary-400 transition-all" style={{ height: `${Math.max(5, (item.count / max) * 78)}%` }} /><span className="pb-2 text-xs text-stone-400">{item.label}</span></div>)}</div>
}

function AlertRow({ label, value, to, tone }: { label: string; value: number; to: string; tone: 'orange' | 'blue' | 'red' }) {
  const tones = { orange: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300', blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300', red: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' }
  return <Link to={to} className={`flex items-center justify-between rounded-xl p-3.5 transition-transform hover:-translate-x-1 ${tones[tone]}`}><span className="text-sm font-semibold">{label}</span><span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/70 px-2 font-black dark:bg-black/15">{value}</span></Link>
}

function EmptyChart() { return <div className="flex h-40 items-center justify-center text-sm text-stone-400">لا توجد بيانات كافية للعرض</div> }
