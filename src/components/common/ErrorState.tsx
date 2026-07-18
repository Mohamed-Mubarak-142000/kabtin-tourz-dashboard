import { Button } from '@nextui-org/react'
import { HiOutlineExclamationCircle } from 'react-icons/hi'

type ErrorStateProps = {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  message = 'تعذر تحميل البيانات. تأكد من تشغيل الخادم وحاول مرة أخرى.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-red-300 bg-red-50 py-12 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
      <HiOutlineExclamationCircle className="h-8 w-8" />
      <p className="max-w-sm text-center text-sm">{message}</p>
      {onRetry && (
        <Button size="sm" color="danger" variant="flat" onPress={onRetry}>
          إعادة المحاولة
        </Button>
      )}
    </div>
  )
}
