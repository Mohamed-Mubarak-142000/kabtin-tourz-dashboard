import { Pagination } from '@nextui-org/react'
import type { PaginationMeta } from '@/types'

type Props = {
  meta: PaginationMeta
  onChange: (page: number) => void
}

export default function TablePagination({ meta, onChange }: Props) {
  if (meta.totalPages <= 1) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 dark:border-stone-800">
      <span className="text-sm text-stone-500">إجمالي النتائج: {meta.total}</span>
      <Pagination page={meta.page} total={meta.totalPages} onChange={onChange} showControls color="primary" />
    </div>
  )
}
