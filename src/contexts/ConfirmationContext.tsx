import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import ConfirmDialog from '@/components/common/ConfirmDialog'

type ConfirmOptions = {
  title?: string
  message: string
  confirmLabel?: string
  confirmColor?: 'primary' | 'danger' | 'warning' | 'success'
}

type ConfirmationContextValue = (options: ConfirmOptions) => Promise<boolean>

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null)

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((result: boolean) => void) | null>(null)

  const confirm = (nextOptions: ConfirmOptions) => {
    resolver.current?.(false)
    setOptions(nextOptions)
    return new Promise<boolean>((resolve) => { resolver.current = resolve })
  }

  const finish = (result: boolean) => {
    resolver.current?.(result)
    resolver.current = null
    setOptions(null)
  }

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        isOpen={!!options}
        title={options?.title ?? 'تأكيد الإجراء'}
        message={options?.message}
        confirmLabel={options?.confirmLabel ?? 'تأكيد'}
        confirmColor={options?.confirmColor ?? 'primary'}
        onConfirm={() => finish(true)}
        onClose={() => finish(false)}
      />
    </ConfirmationContext.Provider>
  )
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext)
  if (!context) throw new Error('useConfirmation must be used within ConfirmationProvider')
  return context
}
