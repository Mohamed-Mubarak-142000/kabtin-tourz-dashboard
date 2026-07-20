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
} from '@nextui-org/react'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiStar } from 'react-icons/hi'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import TablePagination from '@/components/common/TablePagination'
import { deleteBranch, getPaginatedBranches } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import type { Branch, PaginationMeta } from '@/types'

const PAGE_SIZE = 5

export default function BranchesList() {
  const navigate = useNavigate()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPaginatedBranches(page, PAGE_SIZE)
      setBranches(res.data?.items ?? [])
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
      await deleteBranch(deleteTarget._id)
      setBranches((cur) => cur.filter((b) => b._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch (err) {
      setError(apiErrorMessage(err, 'فشل حذف الفرع'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">الفروع</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">إدارة فروع الشركة ومواقعها</p>
        </div>
        <Button
          color="primary"
          startContent={<HiOutlinePlus className="h-5 w-5" />}
          onPress={() => navigate('/branches/new')}
        >
          إضافة فرع
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="card overflow-hidden">
          <Table aria-label="جدول الفروع" removeWrapper>
            <TableHeader>
              <TableColumn>الاسم</TableColumn>
              <TableColumn>العنوان</TableColumn>
              <TableColumn>الهاتف</TableColumn>
              <TableColumn>تقييم جوجل</TableColumn>
              <TableColumn>الإجراءات</TableColumn>
            </TableHeader>
            <TableBody emptyContent="لا توجد فروع بعد">
              {branches.map((branch) => (
                <TableRow key={branch._id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.address}</TableCell>
                  <TableCell dir="ltr">{branch.phone}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <HiStar className="h-4 w-4 text-secondary-500" />
                      {branch.googleRating}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        as={Link}
                        to={`/branches/${branch._id}/edit`}
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
                        onPress={() => setDeleteTarget(branch)}
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
        message={`هل تريد حذف فرع "${deleteTarget?.name}"؟`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
