import { HiStar, HiOutlineStar } from 'react-icons/hi'

type RatingInputProps = {
  value: number
  onChange: (value: number) => void
  max?: number
  label?: string
}

export default function RatingInput({ value, onChange, max = 5, label }: RatingInputProps) {
  return (
    <div>
      {label && <label className="field-label">{label}</label>}
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            aria-label={`${star} نجوم`}
            className="text-secondary-500 transition-transform hover:scale-110"
          >
            {star <= value ? (
              <HiStar className="h-7 w-7" />
            ) : (
              <HiOutlineStar className="h-7 w-7" />
            )}
          </button>
        ))}
        <span className="ms-2 text-sm text-stone-500 dark:text-stone-400">{value}/{max}</span>
      </div>
    </div>
  )
}
