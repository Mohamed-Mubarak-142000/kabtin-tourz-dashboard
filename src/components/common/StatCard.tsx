type StatCardProps = {
  label: string
  value: string | number
  icon?: React.ReactNode
  accent?: 'primary' | 'secondary'
}

export default function StatCard({ label, value, icon, accent = 'primary' }: StatCardProps) {
  const bg =
    accent === 'primary'
      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
      : 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300'

  return (
    <div className="card flex items-center gap-4 p-5">
      {icon && (
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
        <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{value}</p>
      </div>
    </div>
  )
}
