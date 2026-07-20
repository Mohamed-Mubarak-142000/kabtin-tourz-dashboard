import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Select, SelectItem, Textarea } from '@nextui-org/react'
import { HiOutlineArrowRight, HiOutlineUpload, HiOutlineUserAdd } from 'react-icons/hi'
import ErrorState from '@/components/common/ErrorState'
import LoadingState from '@/components/common/LoadingState'
import { createLead, getBranches, getTrips, uploadImages } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { useConfirmation } from '@/contexts/ConfirmationContext'
import type { Branch, LeadInput, Trip } from '@/types'

const paymentMethods = [
  { value: 'cash', label: 'الدفع نقدًا في الفرع' },
  { value: 'bank_transfer', label: 'تحويل بنكي' },
  { value: 'instapay', label: 'InstaPay' },
  { value: 'vodafone_cash', label: 'Vodafone Cash' },
] as const

const roomTypes = [
  { value: 'single', label: 'فردية' },
  { value: 'double', label: 'ثنائية' },
  { value: 'triple', label: 'ثلاثية' },
  { value: 'quad', label: 'رباعية' },
  { value: 'none', label: 'بدون غرفة' },
]

export default function LeadForm() {
  const navigate = useNavigate()
  const confirm = useConfirmation()
  const [trips, setTrips] = useState<Trip[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<LeadInput>({
    defaultValues: { guests: 1, paymentMethod: 'cash' },
  })
  const tripId = watch('tripId')
  const guests = Number(watch('guests') || 1)
  const paymentMethod = watch('paymentMethod')
  const selectedTrip = trips.find((trip) => trip._id === tripId)

  const load = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [tripsResponse, branchesResponse] = await Promise.all([getTrips(), getBranches()])
      setTrips(tripsResponse.data ?? [])
      setBranches(branchesResponse.data ?? [])
    } catch (error) {
      setLoadError(apiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (values: LeadInput) => {
    if (values.paymentMethod !== 'cash' && !proofFile) {
      setSubmitError('صورة إيصال التحويل مطلوبة لطريقة الدفع المختارة')
      return
    }
    if (!(await confirm({ title: 'تأكيد إنشاء الحجز', message: `هل تريد إنشاء حجز للعميل "${values.name}"؟`, confirmLabel: 'إنشاء الحجز', confirmColor: 'primary' }))) return
    setSubmitError(null)
    try {
      let paymentProof: string | undefined
      if (proofFile) {
        const uploaded = await uploadImages([proofFile])
        paymentProof = uploaded.data?.urls[0]
      }
      await createLead({ ...values, guests: Number(values.guests), paymentProof })
      navigate('/leads')
    } catch (error) {
      setSubmitError(apiErrorMessage(error, 'فشل إنشاء الحجز'))
    }
  }

  if (loading) return <LoadingState />
  if (loadError) return <ErrorState message={loadError} onRetry={load} />

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button isIconOnly variant="light" onPress={() => navigate('/leads')}><HiOutlineArrowRight className="h-5 w-5" /></Button>
        <div><h1 className="page-title">إنشاء حجز جديد</h1><p className="text-sm text-stone-500">إضافة حجز لعميل من داخل لوحة التحكم</p></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {submitError && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{submitError}</div>}
        <FormSection title="بيانات العميل">
          <Input label="الاسم بالكامل" variant="bordered" isInvalid={!!errors.name} {...register('name', { required: true })} />
          <Input label="رقم واتساب" variant="bordered" dir="ltr" isInvalid={!!errors.whatsapp} {...register('whatsapp', { required: true })} />
          <Input label="رقم هاتف إضافي" variant="bordered" dir="ltr" {...register('phone')} />
          <Input label="البريد الإلكتروني" type="email" variant="bordered" dir="ltr" {...register('email')} />
          <Input label="الجنسية" variant="bordered" isInvalid={!!errors.nationality} {...register('nationality', { required: true })} />
          <Input label="رقم الهوية أو جواز السفر" variant="bordered" isInvalid={!!errors.identityNumber} {...register('identityNumber', { required: true })} />
        </FormSection>

        <FormSection title="تفاصيل الرحلة">
          <Controller control={control} name="tripId" rules={{ required: true }} render={({ field }) => <Select label="الرحلة" variant="bordered" selectedKeys={field.value ? [field.value] : []} onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])} isInvalid={!!errors.tripId}>{trips.map((trip) => <SelectItem key={trip._id}>{trip.title}{!trip.published ? ' (غير منشورة)' : ''}</SelectItem>)}</Select>} />
          <Controller control={control} name="branch" render={({ field }) => <Select label="الفرع" variant="bordered" selectedKeys={field.value ? [field.value] : []} onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}>{branches.map((branch) => <SelectItem key={branch._id}>{branch.name}</SelectItem>)}</Select>} />
          <Input label="عدد الأفراد" type="number" min={1} variant="bordered" {...register('guests', { required: true, valueAsNumber: true, min: 1 })} />
          <Controller control={control} name="roomType" rules={{ required: true }} render={({ field }) => <Select label="نوع الغرفة" variant="bordered" selectedKeys={field.value ? [field.value] : []} onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}>{roomTypes.map((room) => <SelectItem key={room.value}>{room.label}</SelectItem>)}</Select>} />
        </FormSection>

        {selectedTrip && <div className="grid overflow-hidden rounded-2xl bg-gradient-to-l from-primary-900 to-primary-700 text-white sm:grid-cols-3"><Summary label="سعر الفرد" value={`${selectedTrip.price.toLocaleString('ar-EG')} ${selectedTrip.currency}`} /><Summary label="عدد الأفراد" value={String(guests)} /><Summary label="الإجمالي" value={`${(selectedTrip.price * guests).toLocaleString('ar-EG')} ${selectedTrip.currency}`} accent /></div>}

        <FormSection title="الدفع والملاحظات">
          <Controller control={control} name="paymentMethod" render={({ field }) => <Select label="طريقة الدفع" variant="bordered" selectedKeys={[field.value]} onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}>{paymentMethods.map((method) => <SelectItem key={method.value}>{method.label}</SelectItem>)}</Select>} />
          <div className="rounded-xl border border-dashed border-stone-300 p-4 dark:border-stone-700">
            <label className="flex cursor-pointer items-center gap-3"><HiOutlineUpload className="h-6 w-6 text-primary-600" /><div><p className="font-medium">صورة إيصال التحويل {paymentMethod === 'cash' && '(اختياري)'}</p><p className="text-xs text-stone-500">PNG أو JPG بحد أقصى 8MB</p></div><input type="file" accept="image/*" className="hidden" onChange={(event) => setProofFile(event.target.files?.[0] ?? null)} /></label>
            {proofFile && <p className="mt-2 text-sm text-green-600">تم اختيار: {proofFile.name}</p>}
          </div>
          <div className="sm:col-span-2"><Textarea label="ملاحظات إضافية" variant="bordered" minRows={3} {...register('message')} /></div>
        </FormSection>

        <Button type="submit" color="primary" size="lg" isLoading={isSubmitting} startContent={!isSubmitting && <HiOutlineUserAdd className="h-5 w-5" />} className="self-end px-10">إنشاء الحجز</Button>
      </form>
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="card p-5"><h2 className="mb-5 border-b border-stone-200 pb-3 text-lg font-bold dark:border-stone-800">{title}</h2><div className="grid gap-4 sm:grid-cols-2">{children}</div></section>
}

function Summary({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return <div className={`p-5 ${accent ? 'bg-secondary-500' : 'border-white/10 sm:border-e'}`}><p className="text-xs text-white/60">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>
}
