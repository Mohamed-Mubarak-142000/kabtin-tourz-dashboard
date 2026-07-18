import { useEffect, useState } from 'react'
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
import { HiOutlineTrash } from 'react-icons/hi'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { deleteLead, getLeads, updateLeadStatus } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { leadStatusLabels, leadStatusOptions } from '@/lib/constants'
import type { Lead, LeadStatus } from '@/types'

const statusColors: Record<LeadStatus, 'warning' | 'primary' | 'success'> = {
  new: 'warning',
  contacted: 'primary',
  closed: 'success',
}

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getLeads()
      const sorted = (res.data ?? []).slice().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setLeads(sorted)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleStatusChange = async (lead: Lead, status: LeadStatus) => {
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
      <div>
        <h1 className="page-title">طلبات الحجز</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          الطلبات الواردة من نموذج الحجز في الموقع، الأحدث أولاً
        </p>
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
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell dir="ltr">{lead.whatsapp}</TableCell>
                  <TableCell>{lead.serviceCategory}</TableCell>
                  <TableCell>{lead.branch}</TableCell>
                  <TableCell>{lead.guests}</TableCell>
                  <TableCell>{lead.roomType}</TableCell>
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
                      {leadStatusOptions.map((opt) => (
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
