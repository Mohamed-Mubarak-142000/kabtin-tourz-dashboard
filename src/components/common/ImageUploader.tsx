import { useCallback, useRef, useState } from 'react'
import { Spinner } from '@nextui-org/react'
import { HiOutlineUpload, HiOutlineX, HiOutlineArrowLeft, HiOutlineArrowRight } from 'react-icons/hi'
import { uploadImages } from '@/lib/services'
import { apiErrorMessage } from '@/lib/api'

type ImageUploaderProps = {
  label?: string
  images: string[]
  onChange: (images: string[]) => void
  multiple?: boolean
  maxFiles?: number
}

export default function ImageUploader({
  label,
  images,
  onChange,
  multiple = true,
  maxFiles = 10,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return
      setError(null)
      let files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
      if (!multiple) files = files.slice(0, 1)
      const remainingSlots = maxFiles - images.length
      if (remainingSlots <= 0) {
        setError(`الحد الأقصى ${maxFiles} صور`)
        return
      }
      files = files.slice(0, remainingSlots)
      if (files.length === 0) return

      setIsUploading(true)
      try {
        const res = await uploadImages(files)
        if (res.success && res.data?.urls) {
          const next = multiple ? [...images, ...res.data.urls] : res.data.urls
          onChange(next)
        } else {
          setError(res.error || 'فشل رفع الصور')
        }
      } catch (err) {
        setError(apiErrorMessage(err, 'فشل رفع الصور'))
      } finally {
        setIsUploading(false)
      }
    },
    [images, maxFiles, multiple, onChange]
  )

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div>
      {label && <label className="field-label">{label}</label>}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-stone-300 hover:border-primary-400 dark:border-stone-700'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        {isUploading ? (
          <Spinner color="primary" size="sm" />
        ) : (
          <HiOutlineUpload className="h-8 w-8 text-stone-400" />
        )}
        <p className="text-sm text-stone-500 dark:text-stone-400">
          اسحب الصور هنا أو اضغط للاختيار {multiple && `(حتى ${maxFiles})`}
        </p>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700"
            >
              <img src={src} alt={`صورة ${i + 1}`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {multiple && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        move(i, -1)
                      }}
                      className="rounded-full bg-white/90 p-1.5 text-stone-700 hover:bg-white"
                      aria-label="نقل لليمين"
                    >
                      <HiOutlineArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        move(i, 1)
                      }}
                      className="rounded-full bg-white/90 p-1.5 text-stone-700 hover:bg-white"
                      aria-label="نقل لليسار"
                    >
                      <HiOutlineArrowLeft className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeAt(i)
                  }}
                  className="rounded-full bg-red-600/90 p-1.5 text-white hover:bg-red-600"
                  aria-label="حذف"
                >
                  <HiOutlineX className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
