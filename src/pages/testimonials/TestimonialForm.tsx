import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Select, SelectItem, Textarea } from '@nextui-org/react'
import { HiOutlineArrowRight } from 'react-icons/hi'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import ImageUploader from '@/components/common/ImageUploader'
import RatingInput from '@/components/common/RatingInput'
import { testimonialSchema, type TestimonialFormValues } from '@/schemas'
import { createTestimonial, getTestimonials, updateTestimonial } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { useConfirmation } from '@/contexts/ConfirmationContext'
import { sourceOptions } from '@/lib/constants'

const emptyValues: TestimonialFormValues = {
  name: '',
  text: '',
  rating: 5,
  source: 'google',
  avatar: '',
}

export default function TestimonialForm() {
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
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: emptyValues,
  })

  const load = async () => {
    if (!id) return
    setLoading(true)
    setLoadError(null)
    try {
      const res = await getTestimonials()
      const item = res.data?.find((t) => t._id === id)
      if (!item) {
        setLoadError('لم يتم العثور على التقييم')
        return
      }
      reset({
        name: item.name,
        text: item.text,
        rating: item.rating,
        source: item.source,
        avatar: item.avatar ?? '',
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

  const onSubmit = async (values: TestimonialFormValues) => {
    if (!(await confirm({ title: isEdit ? 'تأكيد تعديل التقييم' : 'تأكيد إضافة التقييم', message: `هل تريد حفظ تقييم "${values.name}"؟`, confirmLabel: 'حفظ', confirmColor: 'primary' }))) return
    setSubmitError(null)
    try {
      if (isEdit && id) {
        await updateTestimonial(id, values)
      } else {
        await createTestimonial(values)
      }
      navigate('/testimonials')
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'فشل حفظ التقييم'))
    }
  }

  const rating = watch('rating')
  const avatar = watch('avatar')

  if (loading) return <LoadingState />
  if (loadError) return <ErrorState message={loadError} onRetry={load} />

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate('/testimonials')}
          aria-label="رجوع"
        >
          <HiOutlineArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="page-title">{isEdit ? 'تعديل تقييم' : 'إضافة تقييم'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {submitError && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {submitError}
          </div>
        )}

        <div className="card grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <Input
            label="اسم العميل"
            variant="bordered"
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
            {...register('name')}
          />

          <Controller
            control={control}
            name="source"
            render={({ field }) => (
              <Select
                label="المصدر"
                variant="bordered"
                selectedKeys={[field.value]}
                onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
              >
                {sourceOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </Select>
            )}
          />

          <div className="md:col-span-2">
            <Textarea
              label="نص التقييم"
              variant="bordered"
              minRows={3}
              isInvalid={!!errors.text}
              errorMessage={errors.text?.message}
              {...register('text')}
            />
          </div>

          <RatingInput label="التقييم" value={rating} onChange={(v) => setValue('rating', v)} />
        </div>

        <div className="card p-5">
          <ImageUploader
            label="صورة العميل (اختياري)"
            images={avatar ? [avatar] : []}
            onChange={(v) => setValue('avatar', v[0] ?? '')}
            multiple={false}
            maxFiles={1}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="flat" onPress={() => navigate('/testimonials')}>
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
