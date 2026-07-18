import { useEffect, useMemo, useState } from 'react'
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
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { deleteTrip, getTrips, updateTrip } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { categoryLabels, categoryOptions } from '@/lib/constants'
import type { Trip } from '@/types'

export default function TripsList() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('')
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getTrips()
      setTrips(res.data ?? [])
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    return trips.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category ? t.category === category : true
      return matchesSearch && matchesCategory
    })
  }, [trips, search, category])

  const togglePublished = async (trip: Trip) => {
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
    <div className="flex flex-col gap-5">
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
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="card overflow-hidden">
          <Table aria-label="جدول الرحلات" removeWrapper>
            <TableHeader>
              <TableColumn>العنوان</TableColumn>
              <TableColumn>الفئة</TableColumn>
              <TableColumn>السعر</TableColumn>
              <TableColumn>منشورة</TableColumn>
              <TableColumn>الإجراءات</TableColumn>
            </TableHeader>
            <TableBody emptyContent="لا توجد رحلات مطابقة">
              {filtered.map((trip) => (
                <TableRow key={trip._id}>
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
                        {trip.featured && (
                          <Chip size="sm" color="secondary" variant="flat">
                            مميزة
                          </Chip>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{categoryLabels[trip.category]}</TableCell>
                  <TableCell>
                    {trip.price} {trip.currency}
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
