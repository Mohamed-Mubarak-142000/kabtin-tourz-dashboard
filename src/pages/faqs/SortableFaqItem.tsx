import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@nextui-org/react'
import { HiOutlineMenu, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import type { Faq } from '@/types'

type SortableFaqItemProps = {
  faq: Faq
  onEdit: () => void
  onDelete: () => void
}

export default function SortableFaqItem({ faq, onEdit, onDelete }: SortableFaqItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: faq._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
    >
      <button
        className="mt-1 cursor-grab text-stone-400 hover:text-stone-600 active:cursor-grabbing dark:hover:text-stone-300"
        aria-label="سحب لإعادة الترتيب"
        {...attributes}
        {...listeners}
      >
        <HiOutlineMenu className="h-5 w-5" />
      </button>

      <div className="flex-1">
        <p className="font-medium text-stone-800 dark:text-stone-100">{faq.question}</p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{faq.answer}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button isIconOnly size="sm" variant="light" onPress={onEdit} aria-label="تعديل">
          <HiOutlinePencil className="h-4 w-4" />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          onPress={onDelete}
          aria-label="حذف"
        >
          <HiOutlineTrash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
