import { useEffect, useState } from 'react'
import { Button } from '@nextui-org/react'
import { HiOutlineDownload } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { getSiteQrCode } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { QrCode } from '@/types'

const SHARE_MESSAGE = 'امسح الباركود ده وادخل موقع كابتن تورز على طول 🕋✈️'

export default function QrCodePage() {
  const [qrCode, setQrCode] = useState<QrCode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSiteQrCode()
      setQrCode(res.data ?? null)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      <div>
        <h1 className="page-title">باركود الموقع</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          باركود واحد ثابت بتصميم كابتن تورز، يوجّه أي حد يعمله سكان لموقعنا مباشرة
        </p>
      </div>

      {loading ? (
        <LoadingState />
      ) : error || !qrCode ? (
        <ErrorState message={error ?? 'تعذر تحميل الباركود'} onRetry={load} />
      ) : (
        <div className="card flex flex-col items-center gap-5 p-8 text-center">
          <img
            src={qrCode.imageUrl}
            alt="باركود كابتن تورز"
            className="w-72 max-w-full rounded-2xl border border-stone-200 dark:border-white/10"
          />
          <p className="text-sm text-stone-400" dir="ltr">
            {qrCode.targetUrl}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              as="a"
              href={qrCode.imageUrl}
              download="captain-tours-qr.png"
              variant="flat"
              startContent={<HiOutlineDownload className="h-4 w-4" />}
            >
              تحميل الصورة
            </Button>
            <Button
              as="a"
              href={buildWhatsAppUrl(undefined, `${SHARE_MESSAGE}\n${qrCode.imageUrl}`)}
              target="_blank"
              rel="noreferrer"
              color="success"
              className="text-white"
              startContent={<FaWhatsapp className="h-4 w-4" />}
            >
              إرسال عبر واتساب
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
