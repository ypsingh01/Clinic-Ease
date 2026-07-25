import { AnimatePresence, motion } from 'framer-motion'
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/motion/usePrefersReducedMotion'

type ToastTone = 'info' | 'success' | 'warning' | 'danger'

type ToastItem = {
  id: string
  title: string
  description?: string
  tone: ToastTone
}

type ToastApi = {
  push: (toast: Omit<ToastItem, 'id'> & { id?: string }) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const icons: Record<ToastTone, ReactNode> = {
  info: <IconInfoCircle size={18} stroke={1.5} />,
  success: <IconCheck size={18} stroke={1.5} />,
  warning: <IconAlertTriangle size={18} stroke={1.5} />,
  danger: <IconAlertTriangle size={18} stroke={1.5} />,
}

const tones: Record<ToastTone, string> = {
  info: 'border-primary/20 bg-surface text-primary',
  success: 'border-success/25 bg-surface text-success',
  warning: 'border-warning/30 bg-surface text-warning',
  danger: 'border-danger/25 bg-surface text-danger',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const reduceMotion = usePrefersReducedMotion()

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (toast: Omit<ToastItem, 'id'> & { id?: string }) => {
      const id = toast.id ?? crypto.randomUUID()
      setItems((prev) => [...prev, { ...toast, id }])
      window.setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  const api = useMemo(() => ({ push, dismiss }), [push, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(100%-2rem,360px)] flex-col gap-2">
          <AnimatePresence>
            {items.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                className={cn(
                  'pointer-events-auto flex gap-3 rounded-[var(--radius-card)] border px-3.5 py-3 shadow-[var(--shadow-soft)]',
                  tones[t.tone],
                )}
                role="status"
              >
                <div className="mt-0.5 shrink-0">{icons[t.tone]}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-text text-sm font-medium">{t.title}</p>
                  {t.description ? (
                    <p className="text-text-secondary mt-0.5 text-xs leading-relaxed">
                      {t.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="text-text-muted hover:text-text shrink-0 rounded-md p-1"
                  aria-label="Dismiss"
                  onClick={() => dismiss(t.id)}
                >
                  <IconX size={16} stroke={1.5} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
