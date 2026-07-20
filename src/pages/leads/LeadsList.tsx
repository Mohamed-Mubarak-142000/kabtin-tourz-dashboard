import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Select,
  SelectItem,
  Chip,
} from '@nextui-org/react'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import TablePagination from '@/components/common/TablePagination'
import { deleteLead, getPaginatedLeads, updateLeadStatus } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { leadStatusLabels, leadStatusOptions } from '@/lib/constants'
import type { Lead, LeadStatus, PaginationMeta } from '@/types'
import { useConfirmation } from '@/contexts/ConfirmationContext'

const PAGE_SIZE = 5

const statusColors: Record<LeadStatus, 'warning' | 'primary' | 'success' | 'danger' | 'secondary' | 'default'> = {
  new: 'warning',
  contacted: 'primary',
  confirmed: 'secondary',
  payment_pending: 'warning',
  paid: 'success',
  cancelled: 'danger',
  closed: 'default',
}

const nextStatuses: Record<LeadStatus, LeadStatus[]> = {
  new: ['contacted', 'cancelled'],
  contacted: ['confirmed', 'cancelled'],
  confirmed: ['payment_pending', 'cancelled'],
  payment_pending: ['paid', 'cancelled'],
  paid: [],
  cancelled: [],
  closed: [],
}

export default function LeadsList() {
  const navigate = useNavigate()
  const confirm = useConfirmation()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPaginatedLeads(page, PAGE_SIZE)
      setLeads(res.data?.items ?? [])
      if (res.data?.pagination) setPagination(res.data.pagination)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page])

  const handleStatusChange = async (lead: Lead, status: LeadStatus) => {
    if (status === lead.status) return
    if (!(await confirm({ title: 'تأكيد تغيير الحالة', message: `هل تريد تغيير حالة طلب "${lead.name}" إلى "${leadStatusLabels[status]}"؟`, confirmLabel: 'تغيير الحالة', confirmColor: 'primary' }))) return
    const prev = leads
    setLeads((cur) => cur.map((l) => (l._id === lead._id ? { ...l, status } : l)))
    try {
      await updateLeadStatus(lead._id, status)
    } catch (err) {
      setLeads(prev)
      setError(apiErrorMessage(err, 'فشل تحديث الحالة'))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteLead(deleteTarget._id)
      setLeads((cur) => cur.filter((l) => l._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch (err) {
      setError(apiErrorMessage(err, 'فشل حذف الطلب'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
        <h1 className="page-title">طلبات الحجز</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          الطلبات الواردة من نموذج الحجز في الموقع، الأحدث أولاً
        </p>
        </div>
        <Button color="primary" startContent={<HiOutlinePlus className="h-5 w-5" />} onPress={() => navigate('/leads/new')}>إنشاء حجز</Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="card overflow-hidden">
          <Table aria-label="جدول طلبات الحجز" removeWrapper>
            <TableHeader>
              <TableColumn>الاسم</TableColumn>
              <TableColumn>واتساب</TableColumn>
              <TableColumn>الخدمة</TableColumn>
              <TableColumn>الفرع</TableColumn>
              <TableColumn>عدد الأفراد</TableColumn>
              <TableColumn>نوع الغرفة</TableColumn>
              <TableColumn>الرسالة</TableColumn>
              <TableColumn>الحالة</TableColumn>
              <TableColumn>التاريخ</TableColumn>
              <TableColumn>حذف</TableColumn>
            </TableHeader>
            <TableBody emptyContent="لا توجد طلبات حجز بعد">
              {leads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell>
                    <div className="min-w-40">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-stone-500">{lead.nationality} · {lead.identityNumber}</p>
                      {lead.email && <p dir="ltr" className="text-left text-xs text-stone-500">{lead.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell dir="ltr"><div>{lead.whatsapp}</div>{lead.phone && <div className="text-xs text-stone-500">{lead.phone}</div>}</TableCell>
                  <TableCell>
                    <div className="min-w-40">
                      <p className="font-medium">{lead.tripTitle ?? lead.serviceCategory}</p>
                      {lead.totalPrice != null && <p className="text-sm font-bold text-primary-600">{lead.totalPrice.toLocaleString('ar-EG')} {lead.currency}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{lead.branch}</TableCell>
                  <TableCell>{lead.guests}</TableCell>
                  <TableCell>
                    <div>{lead.roomType}</div>
                    <div className="text-xs text-stone-500">{lead.paymentMethod}</div>
                    {lead.paymentProof && (
                      <a href={lead.paymentProof} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs text-primary-600 hover:underline">
                        <img src={lead.paymentProof} alt="إيصال التحويل" className="h-10 w-10 rounded-md object-cover" />
                        عرض الإيصال
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{lead.message}</TableCell>
                  <TableCell>
                    <Select
                      size="sm"
                      className="w-36"
                      selectedKeys={[lead.status]}
                      onSelectionChange={(keys) =>
                        handleStatusChange(lead, Array.from(keys)[0] as LeadStatus)
                      }
                      renderValue={() => (
                        <Chip size="sm" color={statusColors[lead.status]} variant="flat">
                          {leadStatusLabels[lead.status]}
                        </Chip>
                      )}
                    >
                      {leadStatusOptions.filter((opt) => opt.value === lead.status || nextStatuses[lead.status].includes(opt.value)).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-stone-500 dark:text-stone-400">
                    {new Date(lead.createdAt).toLocaleString('ar-EG')}
                  </TableCell>
                  <TableCell>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      aria-label="حذف"
                      onPress={() => setDeleteTarget(lead)}
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination meta={pagination} onChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`هل تريد حذف طلب "${deleteTarget?.name}"؟`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
