import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@nextui-org/react'
import { HiOutlineArrowRight } from 'react-icons/hi'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import MapPicker from '@/components/common/MapPicker'
import { branchSchema, type BranchFormValues } from '@/schemas'
import { createBranch, getBranches, updateBranch } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { useConfirmation } from '@/contexts/ConfirmationContext'

const emptyValues: BranchFormValues = {
  name: '',
  address: '',
  phone: '',
  location: { lat: undefined as unknown as number, lng: undefined as unknown as number },
  googleRating: 5,
  mapLink: '',
}

export default function BranchForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const confirm = useConfirmation()

  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: emptyValues,
  })

  const load = async () => {
    if (!id) return
    setLoading(true)
    setLoadError(null)
    try {
      const res = await getBranches()
      const branch = res.data?.find((b) => b._id === id)
      if (!branch) {
        setLoadError('لم يتم العثور على الفرع')
        return
      }
      reset({
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        location: branch.location,
        googleRating: branch.googleRating,
        mapLink: branch.mapLink ?? '',
      })
    } catch (err) {
      setLoadError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isEdit) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onSubmit = async (values: BranchFormValues) => {
    if (!(await confirm({ title: isEdit ? 'تأكيد تعديل الفرع' : 'تأكيد إضافة الفرع', message: `هل تريد حفظ بيانات الفرع "${values.name}"؟`, confirmLabel: 'حفظ', confirmColor: 'primary' }))) return
    setSubmitError(null)
    try {
      if (isEdit && id) {
        await updateBranch(id, values)
      } else {
        await createBranch(values)
      }
      navigate('/branches')
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'فشل حفظ الفرع'))
    }
  }

  const location = watch('location')

  if (loading) return <LoadingState />
  if (loadError) return <ErrorState message={loadError} onRetry={load} />

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button isIconOnly variant="light" onPress={() => navigate('/branches')} aria-label="رجوع">
          <HiOutlineArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="page-title">{isEdit ? 'تعديل فرع' : 'إضافة فرع'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {submitError && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {submitError}
          </div>
        )}

        <div className="card grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <Input
            label="اسم الفرع"
            variant="bordered"
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="رقم الهاتف"
            variant="bordered"
            dir="ltr"
            isInvalid={!!errors.phone}
            errorMessage={errors.phone?.message}
            {...register('phone')}
          />
          <div className="md:col-span-2">
            <Input
              label="العنوان"
              variant="bordered"
              isInvalid={!!errors.address}
              errorMessage={errors.address?.message}
              {...register('address')}
            />
          </div>
          <Input
            label="تقييم جوجل (من 5)"
            type="number"
            step="0.1"
            variant="bordered"
            isInvalid={!!errors.googleRating}
            errorMessage={errors.googleRating?.message}
            {...register('googleRating')}
          />
          <Input
            label="رابط خرائط جوجل"
            variant="bordered"
            dir="ltr"
            isInvalid={!!errors.mapLink}
            errorMessage={errors.mapLink?.message}
            {...register('mapLink')}
          />
        </div>

        <div className="card p-5">
          <MapPicker
            label="موقع الفرع"
            value={location?.lat != null && location?.lng != null ? location : undefined}
            onChange={(v) => setValue('location', v, { shouldValidate: true })}
          />
          {errors.location && (
            <p className="mt-2 text-sm text-red-600">
              {errors.location.lat?.message || errors.location.lng?.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="flat" onPress={() => navigate('/branches')}>
            إلغاء
          </Button>
          <Button type="submit" color="primary" isLoading={isSubmitting}>
            حفظ
          </Button>
        </div>
      </form>
    </div>
  )
}
