import { Switch, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react'
import { HiOutlineMenu, HiOutlineMoon, HiOutlineSun, HiOutlineLogout } from 'react-icons/hi'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useConfirmation } from '@/contexts/ConfirmationContext'

type TopbarProps = {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { username, logout } = useAuth()
  const confirm = useConfirmation()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200 bg-white/80 px-4 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 lg:hidden"
        aria-label="فتح القائمة"
      >
        <HiOutlineMenu className="h-6 w-6" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-4">
        <Switch
          isSelected={theme === 'dark'}
          onValueChange={toggleTheme}
          size="sm"
          color="primary"
          startContent={<HiOutlineSun className="h-4 w-4" />}
          endContent={<HiOutlineMoon className="h-4 w-4" />}
          aria-label="تبديل الوضع الليلي"
        />

        <Dropdown placement="bottom-start">
          <DropdownTrigger>
            <button className="flex items-center gap-2 rounded-full ps-1 pe-3 hover:bg-stone-100 dark:hover:bg-stone-800">
              <Avatar
                size="sm"
                name={username ?? 'A'}
                classNames={{ base: 'bg-primary-600 text-white' }}
              />
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                {username ?? 'المدير'}
              </span>
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="قائمة المستخدم">
            <DropdownItem
              key="logout"
              color="danger"
              startContent={<HiOutlineLogout className="h-4 w-4" />}
              onPress={async () => {
                if (await confirm({ title: 'تسجيل الخروج', message: 'هل تريد تسجيل الخروج من لوحة التحكم؟', confirmLabel: 'تسجيل الخروج', confirmColor: 'danger' })) logout()
              }}
            >
              تسجيل خروج
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  )
}
