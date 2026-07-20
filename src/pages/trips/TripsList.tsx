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
  Input,
  Select,
  SelectItem,
  Switch,
  Chip,
} from '@nextui-org/react'
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineEye,
} from 'react-icons/hi'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import TablePagination from '@/components/common/TablePagination'
import { deleteTrip, getPaginatedTrips, updateTrip } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { categoryLabels, categoryOptions, tripTypeLabels, tripTypeOptions } from '@/lib/constants'
import type { PaginationMeta, Trip } from '@/types'
import { useConfirmation } from '@/contexts/ConfirmationContext'
import { formatCurrency } from '@/lib/currency'

const PAGE_SIZE = 5

export default function TripsList() {
  const navigate = useNavigate()
  const confirm = useConfirmation()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState<string>('')
  const [tripType, setTripType] = useState<string>('')
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })
  const load = async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPaginatedTrips({
        category: category || undefined,
        tripType: tripType || undefined,
        search: debouncedSearch.trim() || undefined,
        page,
        limit: PAGE_SIZE,
      }, signal)
      setTrips(res.data?.items ?? [])
      if (res.data?.pagination) setPagination(res.data.pagination)
    } catch (err) {
      if (signal?.aborted) return
      setError(apiErrorMessage(err))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 500)
    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
    // load intentionally reruns only when a debounced server-side filter changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, tripType, page])

  useEffect(() => setPage(1), [debouncedSearch, category, tripType])

  const togglePublished = async (trip: Trip) => {
    const accepted = await confirm({
      title: trip.published ? 'إلغاء نشر الرحلة' : 'نشر الرحلة',
      message: `هل تريد ${trip.published ? 'إلغاء نشر' : 'نشر'} الرحلة "${trip.title}"؟`,
      confirmLabel: trip.published ? 'إلغاء النشر' : 'نشر',
      confirmColor: trip.published ? 'warning' : 'success',
    })
    if (!accepted) return
    const prev = trips
    setTrips((cur) =>
      cur.map((t) => (t._id === trip._id ? { ...t, published: !t.published } : t))
    )
    try {
      await updateTrip(trip._id, { ...trip, published: !trip.published })
    } catch (err) {
      setTrips(prev)
      setError(apiErrorMessage(err, 'فشل تحديث حالة النشر'))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteTrip(deleteTarget._id)
      setTrips((cur) => cur.filter((t) => t._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch (err) {
      setError(apiErrorMessage(err, 'فشل حذف الرحلة'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">الرحلات</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            إدارة رحلات الحج والعمرة والطيران وباقي الخدمات
          </p>
        </div>
        <Button
          color="primary"
          startContent={<HiOutlinePlus className="h-5 w-5" />}
          onPress={() => navigate('/trips/new')}
        >
          إضافة رحلة
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="بحث بعنوان الرحلة..."
          value={search}
          onValueChange={setSearch}
          startContent={<HiOutlineSearch className="h-4 w-4 text-stone-400" />}
          className="sm:max-w-xs"
        />
        <Select
          placeholder="كل الفئات"
          selectedKeys={category ? [category] : []}
          onSelectionChange={(keys) => setCategory((Array.from(keys)[0] as string) ?? '')}
          className="sm:max-w-xs"
        >
          {categoryOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </Select>
        <Select
          placeholder="كل أنواع الرحلات"
          selectedKeys={tripType ? [tripType] : []}
          onSelectionChange={(keys) => setTripType((Array.from(keys)[0] as string) ?? '')}
          className="sm:max-w-xs"
        >
          {tripTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="table-card">
          <div className="table-scroll">
          <Table aria-label="جدول الرحلات" removeWrapper classNames={{ table: 'dashboard-table min-w-[1050px]' }}>
            <TableHeader>
              <TableColumn>النوع</TableColumn>
              <TableColumn>العنوان</TableColumn>
              <TableColumn>الفئة</TableColumn>
              <TableColumn>السعر</TableColumn>
              <TableColumn>منشورة</TableColumn>
              <TableColumn>الإجراءات</TableColumn>
            </TableHeader>
            <TableBody emptyContent="لا توجد رحلات مطابقة">
              {trips.map((trip) => (
                <TableRow key={trip._id}>
                  <TableCell>
                    <Chip size="sm" variant="flat" color={trip.tripType === 'religious' ? 'primary' : 'secondary'}>
                      {tripTypeLabels[trip.tripType ?? (['hajj', 'umrah'].includes(trip.category) ? 'religious' : 'tourism')]}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {trip.images[0] && (
                        <img
                          src={trip.images[0]}
                          alt={trip.title}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-stone-800 dark:text-stone-100">
                          {trip.title}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-stone-700 dark:text-stone-200">
                    {categoryLabels[trip.category]}
                  </TableCell>
                  <TableCell className="font-medium text-stone-700 dark:text-stone-200">
                    {formatCurrency(trip.price, trip.currency)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      isSelected={trip.published}
                      onValueChange={() => togglePublished(trip)}
                      size="sm"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        as={Link}
                        to={`/trips/${trip._id}`}
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        aria-label="عرض التفاصيل"
                      >
                        <HiOutlineEye className="h-4 w-4" />
                      </Button>
                      <Button
                        as={Link}
                        to={`/trips/${trip._id}/edit`}
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
                        onPress={() => setDeleteTarget(trip)}
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          <TablePagination meta={pagination} onChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`هل تريد حذف الرحلة "${deleteTarget?.title}"؟`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
