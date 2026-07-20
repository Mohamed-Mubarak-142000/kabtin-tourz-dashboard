import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Chip } from '@nextui-org/react'
import { HiOutlineMap, HiOutlineOfficeBuilding, HiOutlineInboxIn } from 'react-icons/hi'
import StatCard from '@/components/common/StatCard'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { getTrips, getBranches, getLeads } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { staggerContainerVariant, staggerItemVariant } from '@/lib/animationVariants'
import type { Lead } from '@/types'

const statusColors: Record<Lead['status'], 'primary' | 'warning' | 'success' | 'secondary' | 'danger' | 'default'> = {
  new: 'warning',
  contacted: 'primary',
  confirmed: 'secondary',
  payment_pending: 'warning',
  paid: 'success',
  cancelled: 'danger',
  closed: 'success',
}

const statusLabels: Record<Lead['status'], string> = {
  confirmed: 'مؤكد',
  payment_pending: 'بانتظار الدفع',
  paid: 'تم الدفع',
  cancelled: 'ملغي',
  new: 'جديد',
  contacted: 'تم التواصل',
  closed: 'مغلق',
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tripsCount, setTripsCount] = useState(0)
  const [branchesCount, setBranchesCount] = useState(0)
  const [newLeadsCount, setNewLeadsCount] = useState(0)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [tripsRes, branchesRes, leadsRes] = await Promise.all([
        getTrips(),
        getBranches(),
        getLeads(),
      ])
      setTripsCount(tripsRes.data?.length ?? 0)
      setBranchesCount(branchesRes.data?.length ?? 0)
      const leads = leadsRes.data ?? []
      setNewLeadsCount(leads.filter((l) => l.status === 'new').length)
      setRecentLeads(
        [...leads]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      )
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={staggerContainerVariant}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItemVariant}>
        <h1 className="page-title">لوحة التحكم</h1>
        <p className="text-sm text-stone-400">
          نظرة عامة سريعة على محتوى الموقع
        </p>
      </motion.div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            variants={staggerContainerVariant}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={staggerItemVariant}>
              <StatCard
                label="إجمالي الرحلات"
                value={tripsCount}
                icon={<HiOutlineMap className="h-6 w-6" />}
                accent="primary"
              />
            </motion.div>
            <motion.div variants={staggerItemVariant}>
              <StatCard
                label="إجمالي الفروع"
                value={branchesCount}
                icon={<HiOutlineOfficeBuilding className="h-6 w-6" />}
                accent="secondary"
              />
            </motion.div>
            <motion.div variants={staggerItemVariant}>
              <StatCard
                label="طلبات حجز جديدة"
                value={newLeadsCount}
                icon={<HiOutlineInboxIn className="h-6 w-6" />}
                accent="primary"
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="card p-6 card-hover"
            variants={staggerItemVariant}
            whileHover={{ boxShadow: "0 20px 40px rgba(217, 119, 6, 0.15)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-100">
                أحدث طلبات الحجز
              </h2>
              <Link to="/leads" className="text-sm text-secondary-400 hover:text-secondary-300 transition-colors">
                عرض الكل →
              </Link>
            </div>

            {recentLeads.length === 0 ? (
              <p className="py-6 text-center text-sm text-stone-400">لا توجد طلبات بعد</p>
            ) : (
              <motion.div
                className="overflow-x-auto"
                variants={staggerContainerVariant}
                initial="initial"
                animate="animate"
              >
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-stone-300">
                      <th className="py-3 font-semibold">الاسم</th>
                      <th className="py-3 font-semibold">واتساب</th>
                      <th className="py-3 font-semibold">الخدمة</th>
                      <th className="py-3 font-semibold">الحالة</th>
                      <th className="py-3 font-semibold">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((lead, idx) => (
                      <motion.tr
                        key={lead._id}
                        variants={staggerItemVariant}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 text-stone-100">{lead.name}</td>
                        <td className="py-3 text-stone-300" dir="ltr">
                          {lead.whatsapp}
                        </td>
                        <td className="py-3 text-stone-300">{lead.serviceCategory}</td>
                        <td className="py-3">
                          <Chip size="sm" color={statusColors[lead.status]} variant="flat">
                            {statusLabels[lead.status]}
                          </Chip>
                        </td>
                        <td className="py-3 text-stone-400">
                          {new Date(lead.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
