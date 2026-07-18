import { Spinner } from '@nextui-org/react'

export default function LoadingState({ label = 'جارِ التحميل...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-stone-500 dark:text-stone-400">
      <Spinner color="primary" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
