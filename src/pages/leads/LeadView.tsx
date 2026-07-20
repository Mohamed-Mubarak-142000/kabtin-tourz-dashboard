import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Chip } from '@nextui-org/react'
import {
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineIdentification,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineTicket,
  HiOutlineUser,
  HiOutlineUsers,
} from 'react-icons/hi'
import ErrorState from '@/components/common/ErrorState'
import LoadingState from '@/components/common/LoadingState'
import { getBranches, getLead } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { leadStatusLabels } from '@/lib/constants'
import type { Lead, LeadStatus } from '@/types'

const statusColors: Record<LeadStatus, 'warning' | 'primary' | 'success' | 'danger' | 'secondary' | 'default'> = {
  new: 'warning',
  contacted: 'primary',
  confirmed: 'secondary',
  payment_pending: 'warning',
  paid: 'success',
  cancelled: 'danger',
  closed: 'default',
}

const roomTypeLabels: Record<string, string> = {
  single: 'فردية',
  double: 'ثنائية',
  triple: 'ثلاثية',
  quad: 'رباعية',
  none: 'بدون غرفة',
}

const paymentMethodLabels: Record<Lead['paymentMethod'], string> = {
  cash: 'الدفع نقدًا في الفرع',
  bank_transfer: 'تحويل بنكي',
  instapay: 'InstaPay',
  vodafone_cash: 'Vodafone Cash',
}

export default function LeadView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState<Lead | null>(null)
  const [branchName, setBranchName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [leadResponse, branchesResponse] = await Promise.all([getLead(id), getBranches()])
      const item = leadResponse.data
      if (!item) throw new Error('لم يتم العثور على طلب الحجز')
      setLead(item)
      const branch = (branchesResponse.data ?? []).find((candidate) => candidate._id === item.branch)
      setBranchName(branch?.name ?? item.branch ?? '')
    } catch (err) {
      setError(apiErrorMessage(err, 'تعذر تحميل تفاصيل طلب الحجز'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  if (loading) return <LoadingState />
  if (error || !lead) return <ErrorState message={error ?? 'لم يتم العثور على طلب الحجز'} onRetry={load} />

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 pb-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button isIconOnly variant="light" onPress={() => navigate('/leads')} aria-label="رجوع">
            <HiOutlineArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="page-title">تفاصيل طلب الحجز</h1>
            <p className="text-sm text-stone-500">جميع بيانات الطلب والدفع في مكان واحد</p>
          </div>
        </div>
        <Chip color={statusColors[lead.status]} variant="flat" size="lg">
          {leadStatusLabels[lead.status]}
        </Chip>
      </div>

      <section className="card overflow-hidden">
        <div className="bg-gradient-to-l from-primary-900 to-primary-700 p-6 text-white">
          <p className="text-sm text-white/60">العميل</p>
          <h2 className="mt-1 text-2xl font-black">{lead.name}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/70">
            <HiOutlineCalendar className="h-4 w-4" />
            تم إنشاء الطلب في {new Date(lead.createdAt).toLocaleString('ar-EG')}
          </p>
        </div>
        <div className="grid gap-px bg-stone-200 sm:grid-cols-2 lg:grid-cols-3 dark:bg-white/10">
          <Detail icon={HiOutlineUser} label="الجنسية" value={lead.nationality} />
          <Detail icon={HiOutlineIdentification} label="رقم الهوية أو جواز السفر" value={lead.identityNumber} dir="ltr" />
          <Detail icon={HiOutlinePhone} label="واتساب" value={lead.whatsapp} dir="ltr" />
          <Detail icon={HiOutlinePhone} label="الهاتف الإضافي" value={lead.phone} dir="ltr" />
          <Detail icon={HiOutlineMail} label="البريد الإلكتروني" value={lead.email} dir="ltr" />
          <Detail icon={HiOutlineLocationMarker} label="الفرع" value={branchName} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <SectionTitle icon={HiOutlineTicket} title="تفاصيل الرحلة" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Info label="الرحلة" value={lead.tripTitle ?? lead.serviceCategory} wide />
            <Info label="عدد الأفراد" value={String(lead.guests)} />
            <Info label="نوع الغرفة" value={roomTypeLabels[lead.roomType] ?? lead.roomType} />
            <Info label="سعر الفرد" value={`${lead.unitPrice.toLocaleString('ar-EG')} ${lead.currency}`} />
            <Info label="الإجمالي" value={`${lead.totalPrice.toLocaleString('ar-EG')} ${lead.currency}`} accent />
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <SectionTitle icon={HiOutlineCreditCard} title="بيانات الدفع" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Info label="طريقة الدفع" value={paymentMethodLabels[lead.paymentMethod]} />
            <Info label="المبلغ المطلوب" value={`${lead.totalPrice.toLocaleString('ar-EG')} ${lead.currency}`} accent />
          </div>
          {lead.paymentProof ? (
            <a href={lead.paymentProof} target="_blank" rel="noreferrer" className="mt-5 block overflow-hidden rounded-xl border border-stone-200 dark:border-white/10">
              <img src={lead.paymentProof} alt="إيصال الدفع" className="h-48 w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
              <span className="block bg-stone-50 p-3 text-center text-sm font-bold text-primary-600 dark:bg-white/5">فتح إيصال الدفع بالحجم الكامل</span>
            </a>
          ) : (
            <div className="mt-5 flex h-24 items-center justify-center rounded-xl border border-dashed border-stone-300 text-sm text-stone-400 dark:border-white/15">لا يوجد إيصال دفع</div>
          )}
        </section>
      </div>

      <section className="card p-5 sm:p-6">
        <SectionTitle icon={HiOutlineCash} title="ملاحظات العميل" />
        <p className="mt-4 min-h-20 whitespace-pre-wrap rounded-xl bg-stone-50 p-4 text-sm leading-7 text-stone-700 dark:bg-white/5 dark:text-stone-200">
          {lead.message || 'لا توجد ملاحظات إضافية.'}
        </p>
      </section>
    </div>
  )
}

function Detail({ icon: Icon, label, value, dir }: { icon: typeof HiOutlineUser; label: string; value?: string; dir?: 'ltr' }) {
  return <div className="flex min-w-0 gap-3 bg-white p-5 dark:bg-primary-900"><Icon className="h-5 w-5 shrink-0 text-secondary-500" /><div className="min-w-0"><p className="text-xs text-stone-400">{label}</p><p className="mt-1 truncate font-semibold" dir={dir}>{value || '—'}</p></div></div>
}

function SectionTitle({ icon: Icon, title }: { icon: typeof HiOutlineTicket; title: string }) {
  return <h2 className="flex items-center gap-2 border-b border-stone-200 pb-3 text-lg font-bold dark:border-white/10"><Icon className="h-5 w-5 text-secondary-500" />{title}</h2>
}

function Info({ label, value, wide, accent }: { label: string; value: string; wide?: boolean; accent?: boolean }) {
  return <div className={`rounded-xl p-4 ${wide ? 'sm:col-span-2' : ''} ${accent ? 'bg-primary-50 text-primary-800 dark:bg-primary-700/30 dark:text-white' : 'bg-stone-50 dark:bg-white/5'}`}><p className="text-xs text-stone-400">{label}</p><p className="mt-1 font-bold">{value}</p></div>
}
