import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  HiOutlineHome,
  HiOutlineMap,
  HiOutlineOfficeBuilding,
  HiOutlineStar,
  HiOutlineQuestionMarkCircle,
  HiOutlineInboxIn,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineX,
} from 'react-icons/hi'
import { useAuth } from '@/contexts/AuthContext'
import { useConfirmation } from '@/contexts/ConfirmationContext'

type NavItem = {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'لوحة التحكم', icon: HiOutlineHome, end: true },
  { to: '/trips', label: 'الرحلات', icon: HiOutlineMap },
  { to: '/branches', label: 'الفروع', icon: HiOutlineOfficeBuilding },
  { to: '/testimonials', label: 'التقييمات', icon: HiOutlineStar },
  { to: '/faqs', label: 'الأسئلة الشائعة', icon: HiOutlineQuestionMarkCircle },
  { to: '/leads', label: 'طلبات الحجز', icon: HiOutlineInboxIn },
  { to: '/settings', label: 'الإعدادات', icon: HiOutlineCog },
]

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { logout } = useAuth()
  const confirm = useConfirmation()
  const [logoError, setLogoError] = useState(false)

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex h-dvh w-64 shrink-0 transform flex-col border-l border-stone-200 bg-white transition-transform duration-200 dark:border-stone-800 dark:bg-stone-900 lg:sticky lg:top-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-stone-200 px-4 dark:border-stone-800">
          <div className="flex items-center gap-2">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="كابتن تورز"
                className="h-9 w-9 rounded-lg object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 font-bold text-white">
                ك
              </div>
            )}
            <span className="font-bold text-stone-800 dark:text-stone-100">
              كابتن تورز
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-primary-50 hover:text-primary-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-primary-400'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button
            onClick={async () => {
              if (await confirm({ title: 'تسجيل الخروج', message: 'هل تريد تسجيل الخروج من لوحة التحكم؟', confirmLabel: 'تسجيل الخروج', confirmColor: 'danger' })) logout()
            }}
            className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <HiOutlineLogout className="h-5 w-5 shrink-0" />
            <span>تسجيل خروج</span>
          </button>
        </nav>
      </aside>
    </>
  )
}
