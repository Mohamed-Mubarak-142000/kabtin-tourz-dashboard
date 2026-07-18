import { useState } from 'react'
import { Button, Input } from '@nextui-org/react'
import { HiOutlinePlus, HiOutlineX } from 'react-icons/hi'

type StringListInputProps = {
  label?: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  variant?: 'tags' | 'list'
}

/**
 * Generic repeatable-string input.
 * variant="tags" renders entries as inline chips (used for Trip `includes`).
 * variant="list" renders entries as stacked rows (used for phones / whatsappNumbers).
 */
export default function StringListInput({
  label,
  values,
  onChange,
  placeholder = 'أدخل قيمة ثم اضغط إضافة',
  variant = 'tags',
}: StringListInputProps) {
  const [draft, setDraft] = useState('')

  const addValue = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...values, trimmed])
    setDraft('')
  }

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div>
      {label && <label className="field-label">{label}</label>}
      <div className="flex gap-2">
        <Input
          value={draft}
          onValueChange={setDraft}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addValue()
            }
          }}
        />
        <Button isIconOnly color="primary" variant="flat" onPress={addValue} aria-label="إضافة">
          <HiOutlinePlus className="h-5 w-5" />
        </Button>
      </div>

      {variant === 'tags' ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
            >
              {v}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="text-primary-500 hover:text-red-600"
                aria-label="حذف"
              >
                <HiOutlineX className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {values.length === 0 && (
            <p className="text-xs text-stone-400">لا توجد عناصر بعد</p>
          )}
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {values.map((v, i) => (
            <div
              key={`${v}-${i}`}
              className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-700"
            >
              <span dir="ltr" className="text-right">{v}</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="text-stone-400 hover:text-red-600"
                aria-label="حذف"
              >
                <HiOutlineX className="h-4 w-4" />
              </button>
            </div>
          ))}
          {values.length === 0 && (
            <p className="text-xs text-stone-400">لا توجد عناصر بعد</p>
          )}
        </div>
      )}
    </div>
  )
}
