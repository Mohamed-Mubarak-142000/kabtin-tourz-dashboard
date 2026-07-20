import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
  RadioGroup,
  Radio,
} from '@nextui-org/react'
import { HiOutlineArrowRight } from 'react-icons/hi'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import ImageUploader from '@/components/common/ImageUploader'
import MapPicker from '@/components/common/MapPicker'
import StringListInput from '@/components/common/StringListInput'
import { tripSchema, type TripFormValues } from '@/schemas'
import { createTrip, getTripById, updateTrip } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { categoryOptions, currencyOptions } from '@/lib/constants'
import { useConfirmation } from '@/contexts/ConfirmationContext'
import { currencyLabels } from '@/lib/currency'

const emptyValues: TripFormValues = {
  title: '',
  category: 'umrah',
  tripType: 'religious',
  price: 0,
  currency: 'EGP',
  duration: '',
  hotelInfo: '',
  includes: [],
  images: [],
  location: undefined,
  description: '',
  published: true,
}

export default function TripForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const confirm = useConfirmation()

  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: emptyValues,
  })

  const loadTrip = async () => {
    if (!id) return
    setLoading(true)
    setLoadError(null)
    try {
      const res = await getTripById(id)
      const trip = res.data
      if (!trip) {
        setLoadError('لم يتم العثور على الرحلة')
        return
      }
      reset({
        title: trip.title,
        category: trip.category,
        tripType: trip.tripType ?? (['hajj', 'umrah'].includes(trip.category) ? 'religious' : 'tourism'),
        price: trip.price,
        currency: trip.currency,
        duration: trip.duration,
        hotelInfo: trip.hotelInfo ?? '',
        includes: trip.includes ?? [],
        images: trip.images ?? [],
        location: trip.location,
        description: trip.description,
        published: trip.published,
      })
    } catch (err) {
      setLoadError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isEdit) loadTrip()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onSubmit = async (values: TripFormValues) => {
    const accepted = await confirm({
      title: isEdit ? 'تأكيد تعديل الرحلة' : 'تأكيد إضافة الرحلة',
      message: `هل تريد ${isEdit ? 'حفظ تعديلات' : 'إضافة'} الرحلة "${values.title}"؟`,
      confirmLabel: 'حفظ',
      confirmColor: 'primary',
    })
    if (!accepted) return
    setSubmitError(null)
    try {
      if (isEdit && id) {
        await updateTrip(id, values)
      } else {
        await createTrip(values)
      }
      navigate('/trips')
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'فشل حفظ الرحلة'))
    }
  }

  const includes = watch('includes')
  const images = watch('images')
  const location = watch('location')
  const published = watch('published')

  if (loading) return <LoadingState />
  if (loadError) return <ErrorState message={loadError} onRetry={loadTrip} />

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate('/trips')}
          aria-label="رجوع"
        >
          <HiOutlineArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="page-title">{isEdit ? 'تعديل رحلة' : 'إضافة رحلة'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {submitError && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {submitError}
          </div>
        )}

        <div className="card grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <Input
            label="عنوان الرحلة"
            variant="bordered"
            isInvalid={!!errors.title}
            errorMessage={errors.title?.message}
            {...register('title')}
          />

          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                label="الفئة"
                variant="bordered"
                selectedKeys={[field.value]}
                onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                isInvalid={!!errors.category}
                errorMessage={errors.category?.message}
              >
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </Select>
            )}
          />

          <Input
            label="السعر"
            type="number"
            variant="bordered"
            isInvalid={!!errors.price}
            errorMessage={errors.price?.message}
            {...register('price')}
          />

          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <Select
                label="العملة"
                variant="bordered"
                selectedKeys={[field.value]}
                onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
              >
                {currencyOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {currencyLabels[c] ?? c}
                  </SelectItem>
                ))}
              </Select>
            )}
          />

          <Input
            label="المدة (مثال: 7 أيام / 6 ليالٍ)"
            variant="bordered"
            isInvalid={!!errors.duration}
            errorMessage={errors.duration?.message}
            {...register('duration')}
          />

          <Input
            label="معلومات الفندق"
            variant="bordered"
            {...register('hotelInfo')}
          />

          <div className="md:col-span-2">
            <Textarea
              label="الوصف"
              variant="bordered"
              minRows={4}
              isInvalid={!!errors.description}
              errorMessage={errors.description?.message}
              {...register('description')}
            />
          </div>

          <div className="flex flex-col gap-4 md:col-span-2">
            <Controller
              control={control}
              name="tripType"
              render={({ field }) => (
                <RadioGroup label="نوع الرحلة" orientation="horizontal" value={field.value} onValueChange={field.onChange} classNames={{ wrapper: 'gap-6' }}>
                  <Radio value="religious" color="primary">رحلة دينية</Radio>
                  <Radio value="tourism" color="secondary">رحلة سياحية</Radio>
                </RadioGroup>
              )}
            />
            <div className="flex flex-wrap items-center gap-6">
            <Switch
              isSelected={published}
              onValueChange={(v) => setValue('published', v)}
              color="primary"
            >
              {published ? 'منشورة' : 'غير منشورة'}
            </Switch>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <StringListInput
            label="يشمل (Includes)"
            values={includes}
            onChange={(v) => setValue('includes', v)}
            placeholder="مثال: تذاكر طيران"
            variant="tags"
          />
        </div>

        <div className="card p-5">
          <ImageUploader
            label="صور الرحلة"
            images={images}
            onChange={(v) => setValue('images', v)}
            multiple
            maxFiles={10}
          />
        </div>

        <div className="card p-5">
          <MapPicker
            label="موقع الرحلة (اختياري)"
            value={location}
            onChange={(v) => setValue('location', { ...location, ...v })}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="flat" onPress={() => navigate('/trips')}>
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
