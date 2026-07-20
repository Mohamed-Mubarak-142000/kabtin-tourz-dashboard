import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Chip } from '@nextui-org/react'
import Map, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineCurrencyDollar,
  HiOutlineExternalLink,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
  HiOutlinePencil,
  HiOutlinePhotograph,
  HiOutlineTag,
} from 'react-icons/hi'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { getTripById } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { categoryLabels, tripTypeLabels } from '@/lib/constants'
import type { Trip } from '@/types'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export default function TripView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  const loadTrip = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const response = await getTripById(id)
      setTrip(response.data ?? null)
      if (!response.data) setError('لم يتم العثور على الرحلة')
    } catch (err) {
      setError(apiErrorMessage(err, 'تعذر تحميل تفاصيل الرحلة'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrip()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <LoadingState />
  if (error || !trip) return <ErrorState message={error ?? 'لم يتم العثور على الرحلة'} onRetry={loadTrip} />

  const mapUrl = trip.location
    ? `https://www.google.com/maps?q=${trip.location.lat},${trip.location.lng}`
    : null
  const coverImage = trip.images[activeImage]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="light" onPress={() => navigate('/trips')} startContent={<HiOutlineArrowRight className="h-5 w-5" />}>
          الرجوع للرحلات
        </Button>
        <Button as={Link} to={`/trips/${trip._id}/edit`} color="primary" startContent={<HiOutlinePencil className="h-5 w-5" />}>
          تعديل الرحلة
        </Button>
      </div>

      <section className="relative min-h-[380px] overflow-hidden rounded-3xl bg-primary-900 shadow-xl md:min-h-[480px]">
        {coverImage ? (
          <img src={coverImage} alt={trip.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-950">
            <HiOutlinePhotograph className="h-24 w-24 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
          <div className="mb-4 flex flex-wrap gap-2">
            <Chip className="bg-white/90 text-primary-800" startContent={<HiOutlineTag className="h-4 w-4" />}>
              {categoryLabels[trip.category]}
            </Chip>
            <Chip color={trip.tripType === 'tourism' ? 'secondary' : 'primary'}>
              {tripTypeLabels[trip.tripType ?? (['hajj', 'umrah'].includes(trip.category) ? 'religious' : 'tourism')]}
            </Chip>
            <Chip color={trip.published ? 'success' : 'default'} variant="solid">
              {trip.published ? 'منشورة' : 'غير منشورة'}
            </Chip>
          </div>
          <h1 className="max-w-4xl text-3xl font-black leading-tight md:text-5xl">{trip.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/85 md:text-base">
            {trip.duration && <span className="flex items-center gap-2"><HiOutlineCalendar className="h-5 w-5" />{trip.duration}</span>}
            {trip.location?.address && <span className="flex items-center gap-2"><HiOutlineLocationMarker className="h-5 w-5" />{trip.location.address}</span>}
          </div>
        </div>
      </section>

      {trip.images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {trip.images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all md:h-24 md:w-36 ${activeImage === index ? 'border-primary-600 shadow-md' : 'border-transparent opacity-65 hover:opacity-100'}`}
            >
              <img src={image} alt={`${trip.title} ${index + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={HiOutlineCurrencyDollar} label="السعر" value={`${trip.price.toLocaleString('ar-EG')} ${trip.currency}`} accent />
        <InfoCard icon={HiOutlineCalendar} label="مدة الرحلة" value={trip.duration || 'غير محددة'} />
        <InfoCard icon={HiOutlineOfficeBuilding} label="الإقامة والفندق" value={trip.hotelInfo || 'غير محدد'} />
        <InfoCard icon={HiOutlineTag} label="كود الرحلة" value={trip.slug} ltr />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
        <div className="flex flex-col gap-6">
          <section className="card p-6 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-7 w-1.5 rounded-full bg-secondary-500" />
              <h2 className="text-2xl font-bold text-stone-900 dark:text-white">وصف الرحلة</h2>
            </div>
            <p className="whitespace-pre-line text-base leading-9 text-stone-700 dark:text-stone-300">
              {trip.description || 'لا يوجد وصف مضاف لهذه الرحلة.'}
            </p>
          </section>

          <section className="card p-6 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-7 w-1.5 rounded-full bg-green-500" />
              <h2 className="text-2xl font-bold text-stone-900 dark:text-white">الرحلة تشمل</h2>
            </div>
            {trip.includes.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {trip.includes.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3 text-stone-700 dark:bg-green-950/25 dark:text-stone-200">
                    <HiOutlineCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-stone-500">لم تتم إضافة خدمات مشمولة.</p>}
          </section>
        </div>

        <aside className="card overflow-hidden lg:sticky lg:top-20">
          <div className="border-b border-stone-200 p-5 dark:border-stone-800">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">موقع الرحلة</h2>
            <p className="mt-1 text-sm text-stone-500">الموقع والإحداثيات المحفوظة</p>
          </div>
          {trip.location ? (
            <>
              {MAPBOX_TOKEN && (
                <div className="h-72">
                  <Map initialViewState={{ latitude: trip.location.lat, longitude: trip.location.lng, zoom: 13 }} mapboxAccessToken={MAPBOX_TOKEN} mapStyle="mapbox://styles/mapbox/streets-v12" style={{ width: '100%', height: '100%' }} attributionControl={false}>
                    <Marker longitude={trip.location.lng} latitude={trip.location.lat} anchor="bottom">
                      <HiOutlineLocationMarker className="h-10 w-10 text-primary-600 drop-shadow-lg" />
                    </Marker>
                  </Map>
                </div>
              )}
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-start gap-3">
                  <HiOutlineLocationMarker className="mt-1 h-5 w-5 shrink-0 text-primary-600" />
                  <p className="font-medium text-stone-800 dark:text-stone-200">{trip.location.address || 'عنوان غير مسجل'}</p>
                </div>
                <div dir="ltr" className="rounded-xl bg-stone-100 px-4 py-3 text-left font-mono text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                  <p>Lat: {trip.location.lat.toFixed(6)}</p>
                  <p>Lng: {trip.location.lng.toFixed(6)}</p>
                </div>
                {mapUrl && (
                  <Button as="a" href={mapUrl} target="_blank" rel="noreferrer" variant="flat" color="primary" fullWidth endContent={<HiOutlineExternalLink className="h-4 w-4" />}>
                    فتح على Google Maps
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 p-10 text-center text-stone-400">
              <HiOutlineLocationMarker className="h-12 w-12" />
              <p>لم يتم تحديد موقع لهذه الرحلة.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

type InfoCardProps = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accent?: boolean
  ltr?: boolean
}

function InfoCard({ icon: Icon, label, value, accent, ltr }: InfoCardProps) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent ? 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300' : 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
        <p dir={ltr ? 'ltr' : undefined} className={`mt-1 truncate font-bold ${accent ? 'text-secondary-700 dark:text-secondary-300' : 'text-stone-900 dark:text-white'}`}>{value}</p>
      </div>
    </div>
  )
}
