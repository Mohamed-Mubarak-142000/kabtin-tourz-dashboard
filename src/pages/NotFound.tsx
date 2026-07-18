import { Link } from 'react-router-dom'
import { Button } from '@nextui-org/react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 text-center dark:bg-stone-950">
      <h1 className="text-6xl font-extrabold text-primary-600">404</h1>
      <p className="text-stone-600 dark:text-stone-300">الصفحة غير موجودة</p>
      <Button as={Link} to="/" color="primary">
        العودة للوحة التحكم
      </Button>
    </div>
  )
}
