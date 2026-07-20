import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Avatar,
  Chip,
} from '@nextui-org/react'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiStar } from 'react-icons/hi'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import TablePagination from '@/components/common/TablePagination'
import { deleteTestimonial, getPaginatedTestimonials } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { sourceLabels } from '@/lib/constants'
import type { PaginationMeta, Testimonial } from '@/types'

const PAGE_SIZE = 5

export default function TestimonialsList() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPaginatedTestimonials(page, PAGE_SIZE)
      setItems(res.data?.items ?? [])
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

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteTestimonial(deleteTarget._id)
      setItems((cur) => cur.filter((t) => t._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch (err) {
      setError(apiErrorMessage(err, 'فشل حذف التقييم'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">التقييمات</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            إدارة آراء وتقييمات العملاء المعروضة في الموقع
          </p>
        </div>
        <Button
          color="primary"
          startContent={<HiOutlinePlus className="h-5 w-5" />}
          onPress={() => navigate('/testimonials/new')}
        >
          إضافة تقييم
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="card overflow-hidden">
          <Table aria-label="جدول التقييمات" removeWrapper>
            <TableHeader>
              <TableColumn>العميل</TableColumn>
              <TableColumn>النص</TableColumn>
              <TableColumn>التقييم</TableColumn>
              <TableColumn>المصدر</TableColumn>
              <TableColumn>الإجراءات</TableColumn>
            </TableHeader>
            <TableBody emptyContent="لا توجد تقييمات بعد">
              {items.map((t) => (
                <TableRow key={t._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar src={t.avatar} name={t.name} size="sm" />
                      <span className="font-medium">{t.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{t.text}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <HiStar className="h-4 w-4 text-secondary-500" />
                      {t.rating}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat">
                      {sourceLabels[t.source]}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        as={Link}
                        to={`/testimonials/${t._id}/edit`}
                        isIconOnly
                        size="sm"
                        variant="light"
                        aria-label="تعديل"
                      >
                        <HiOutlinePencil className="h-4 w-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        aria-label="حذف"
                        onPress={() => setDeleteTarget(t)}
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </Button>
                    </div>
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
        message={`هل تريد حذف تقييم "${deleteTarget?.name}"؟`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
