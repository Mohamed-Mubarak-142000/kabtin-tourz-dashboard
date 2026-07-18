import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Textarea } from '@nextui-org/react'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import ImageUploader from '@/components/common/ImageUploader'
import StringListInput from '@/components/common/StringListInput'
import { settingsSchema, type SettingsFormValues } from '@/schemas'
import { getSettings, updateSettings } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'

const emptyValues: SettingsFormValues = {
  hero: { title: '', subtitle: '', images: [] },
  phones: [],
  whatsappNumbers: [],
  socialLinks: { facebook: '', instagram: '', youtube: '', tiktok: '' },
  stats: { years: 0, clients: 0, branchesCount: 0, googleRating: 0 },
  about: '',
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: emptyValues,
  })

  const load = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await getSettings()
      if (res.data) reset(res.data)
    } catch (err) {
      setLoadError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (values: SettingsFormValues) => {
    setSubmitError(null)
    setSaved(false)
    try {
      await updateSettings(values)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'فشل حفظ الإعدادات'))
    }
  }

  const heroImages = watch('hero.images')
  const phones = watch('phones')
  const whatsappNumbers = watch('whatsappNumbers')

  if (loading) return <LoadingState />
  if (loadError) return <ErrorState message={loadError} onRetry={load} />

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="page-title">الإعدادات</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          إعدادات عامة للموقع: الصفحة الرئيسية، أرقام التواصل، الروابط، والإحصائيات
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {submitError && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {submitError}
          </div>
        )}
        {saved && (
          <div className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            تم حفظ الإعدادات بنجاح
          </div>
        )}

        <section className="card flex flex-col gap-4 p-5">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">
            القسم الرئيسي (Hero)
          </h2>
          <Input
            label="العنوان الرئيسي"
            variant="bordered"
            isInvalid={!!errors.hero?.title}
            errorMessage={errors.hero?.title?.message}
            {...register('hero.title')}
          />
          <Input
            label="العنوان الفرعي"
            variant="bordered"
            {...register('hero.subtitle')}
          />
          <ImageUploader
            label="صور الواجهة الرئيسية"
            images={heroImages}
            onChange={(v) => setValue('hero.images', v)}
            multiple
            maxFiles={10}
          />
        </section>

        <section className="card flex flex-col gap-4 p-5 md:flex-row md:gap-8">
          <div className="flex-1">
            <StringListInput
              label="أرقام الهاتف"
              values={phones}
              onChange={(v) => setValue('phones', v)}
              placeholder="+20 1xx xxx xxxx"
              variant="list"
            />
          </div>
          <div className="flex-1">
            <StringListInput
              label="أرقام واتساب"
              values={whatsappNumbers}
              onChange={(v) => setValue('whatsappNumbers', v)}
              placeholder="+20 1xx xxx xxxx"
              variant="list"
            />
          </div>
        </section>

        <section className="card grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 md:col-span-2">
            روابط التواصل الاجتماعي
          </h2>
          <Input label="فيسبوك" variant="bordered" dir="ltr" {...register('socialLinks.facebook')} />
          <Input label="إنستغرام" variant="bordered" dir="ltr" {...register('socialLinks.instagram')} />
          <Input label="يوتيوب" variant="bordered" dir="ltr" {...register('socialLinks.youtube')} />
          <Input label="تيك توك" variant="bordered" dir="ltr" {...register('socialLinks.tiktok')} />
        </section>

        <section className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 sm:col-span-2 lg:col-span-4">
            الإحصائيات
          </h2>
          <Input
            label="سنوات الخبرة"
            type="number"
            variant="bordered"
            {...register('stats.years')}
          />
          <Input
            label="عدد العملاء"
            type="number"
            variant="bordered"
            {...register('stats.clients')}
          />
          <Input
            label="عدد الفروع"
            type="number"
            variant="bordered"
            {...register('stats.branchesCount')}
          />
          <Input
            label="تقييم جوجل"
            type="number"
            step="0.1"
            variant="bordered"
            {...register('stats.googleRating')}
          />
        </section>

        <section className="card flex flex-col gap-4 p-5">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">من نحن</h2>
          <Textarea label="نبذة عن الشركة" variant="bordered" minRows={5} {...register('about')} />
        </section>

        <div className="flex justify-end">
          <Button type="submit" color="primary" isLoading={isSubmitting}>
            حفظ الإعدادات
          </Button>
        </div>
      </form>
    </div>
  )
}
