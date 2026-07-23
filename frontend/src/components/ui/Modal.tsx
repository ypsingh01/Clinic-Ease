import { AnimatePresence, motion } from 'framer-motion'
import { IconX } from '@tabler/icons-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { useFocusOnMount } from '@/a11y'
import { usePrefersReducedMotion } from '@/motion/usePrefersReducedMotion'
import { Button } from './Button'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const widths = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const reduceMotion = usePrefersReducedMotion()
  const panelRef = useFocusOnMount<HTMLDivElement>()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-[rgba(44,44,42,0.35)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={cn(
              'border-border bg-surface relative z-10 w-full rounded-[var(--radius-lg)] border shadow-[var(--shadow-modal)]',
              widths[size],
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-border flex items-center justify-between border-b px-5 py-4">
              <h2 id="modal-title" className="font-display text-lg font-medium">
                {title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="size-9 min-h-9 px-0"
                aria-label="Close"
                onClick={onClose}
              >
                <IconX size={18} stroke={1.5} />
              </Button>
            </div>
            <div className="px-5 py-4">{children}</div>
            {footer ? (
              <div className="border-border flex flex-wrap justify-end gap-2 border-t px-5 py-4">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
