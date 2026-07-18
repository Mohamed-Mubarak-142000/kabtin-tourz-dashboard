import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@nextui-org/react'
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineExclamationCircle } from 'react-icons/hi'
import gsap from 'gsap'
import { useAuth } from '@/contexts/AuthContext'
import { loginSchema, type LoginFormValues } from '@/schemas'
import { apiErrorMessage } from '@/lib/api'

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
    )
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from || '/'
    return <Navigate to={from} replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    try {
      await login(values.username, values.password)
      navigate('/', { replace: true })
    } catch (err) {
      setServerError(apiErrorMessage(err, 'اسم المستخدم أو كلمة المرور غير صحيحة'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 to-stone-50 px-4 dark:from-stone-950 dark:to-stone-900">
      <div ref={cardRef} className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          {!logoError ? (
            <img
              src="/logo.png"
              alt="كابتن تورز"
              className="h-14 w-14 rounded-2xl object-contain shadow-lg"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-2xl font-bold text-white shadow-lg">
              ك
            </div>
          )}
          <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">
            لوحة تحكم كابتن تورز
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            سجّل الدخول لإدارة محتوى الموقع
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card flex flex-col gap-4 p-6"
          noValidate
        >
          {serverError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <HiOutlineExclamationCircle className="h-5 w-5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <Input
            label="اسم المستخدم"
            variant="bordered"
            isInvalid={!!errors.username}
            errorMessage={errors.username?.message}
            {...register('username')}
          />

          <Input
            label="كلمة المرور"
            variant="bordered"
            type={showPassword ? 'text' : 'password'}
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
            endContent={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-stone-400"
                aria-label="إظهار/إخفاء كلمة المرور"
              >
                {showPassword ? (
                  <HiOutlineEyeOff className="h-5 w-5" />
                ) : (
                  <HiOutlineEye className="h-5 w-5" />
                )}
              </button>
            }
            {...register('password')}
          />

          <Button type="submit" color="primary" isLoading={isSubmitting} className="mt-2">
            تسجيل الدخول
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-stone-400">
          استخدم بيانات المدير المُعرّفة في إعدادات الخادم (ADMIN_USERNAME / ADMIN_PASSWORD)
        </p>
      </div>
    </div>
  )
}
