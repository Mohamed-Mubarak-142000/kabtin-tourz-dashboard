import { useEffect, useState } from 'react'
import { Button } from '@nextui-org/react'
import { HiOutlinePlus } from 'react-icons/hi'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import SortableFaqItem from './SortableFaqItem'
import FaqFormModal from './FaqFormModal'
import { createFaq, deleteFaq, getFaqs, reorderFaqs, updateFaq } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'
import type { Faq } from '@/types'
import type { FaqFormValues } from '@/schemas'

// Drag-and-drop reordering uses @dnd-kit/sortable rather than plain up/down
// buttons: it gives a native-feeling reorder UX for a short list like FAQs
// with a small, well-maintained dependency (already used nowhere else, but
// worth the ~15kb given this is the one page whose entire purpose is ordering).
export default function FaqsList() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Faq | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getFaqs()
      setFaqs((res.data ?? []).slice().sort((a, b) => a.order - b.order))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const persistOrder = async (ordered: Faq[]) => {
    setIsSaving(true)
    try {
      await reorderFaqs(ordered.map((f, i) => ({ id: f._id, order: i })))
    } catch (err) {
      setError(apiErrorMessage(err, 'فشل حفظ الترتيب'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setFaqs((items) => {
      const oldIndex = items.findIndex((i) => i._id === active.id)
      const newIndex = items.findIndex((i) => i._id === over.id)
      const reordered = arrayMove(items, oldIndex, newIndex)
      persistOrder(reordered)
      return reordered
    })
  }

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (faq: Faq) => {
    setEditing(faq)
    setModalOpen(true)
  }

  const handleSubmit = async (values: FaqFormValues) => {
    try {
      if (editing) {
        const updated = await updateFaq(editing._id, { ...values, order: editing.order })
        setFaqs((cur) =>
          cur.map((f) => (f._id === editing._id ? (updated.data ?? { ...f, ...values }) : f))
        )
      } else {
        const created = await createFaq({ ...values, order: faqs.length })
        if (created.data) setFaqs((cur) => [...cur, created.data!])
      }
      setModalOpen(false)
    } catch (err) {
      setError(apiErrorMessage(err, 'فشل حفظ السؤال'))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteFaq(deleteTarget._id)
      setFaqs((cur) => cur.filter((f) => f._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch (err) {
      setError(apiErrorMessage(err, 'فشل حذف السؤال'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">الأسئلة الشائعة</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            اسحب لإعادة الترتيب — يُحفظ الترتيب تلقائيًا {isSaving && '(جارِ الحفظ...)'}
          </p>
        </div>
        <Button color="primary" startContent={<HiOutlinePlus className="h-5 w-5" />} onPress={openCreate}>
          إضافة سؤال
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : faqs.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-400">لا توجد أسئلة بعد</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={faqs.map((f) => f._id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {faqs.map((faq) => (
                <SortableFaqItem
                  key={faq._id}
                  faq={faq}
                  onEdit={() => openEdit(faq)}
                  onDelete={() => setDeleteTarget(faq)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <FaqFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`هل تريد حذف السؤال "${deleteTarget?.question}"؟`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
