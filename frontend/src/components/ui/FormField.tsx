import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { IconAlertCircle } from '@tabler/icons-react'
import { cn } from '@/lib/cn'

type FieldProps = {
  label: string
  hint?: string
  error?: string
  className?: string
  children: ReactNode
  htmlFor?: string
}

export function FormField({ label, hint, error, className, children, htmlFor }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="text-text text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-danger flex items-start gap-1.5 text-xs leading-relaxed" role="alert">
          <IconAlertCircle size={14} stroke={1.5} className="mt-0.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="text-text-muted text-xs leading-relaxed">{hint}</p>
      ) : null}
    </div>
  )
}

const controlBase =
  'w-full min-h-[48px] rounded-[var(--radius-control)] border border-border bg-surface px-4 text-[15px] text-text placeholder:text-text-muted transition-[border-color,box-shadow] duration-[var(--duration-fast)] hover:border-primary/25 focus:border-primary focus:outline-none focus:shadow-[var(--focus-ring)] disabled:opacity-50'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, id, ...props }, ref) {
    return <input ref={ref} id={id} className={cn(controlBase, className)} {...props} />
  },
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, id, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      id={id}
      className={cn(controlBase, 'min-h-[110px] resize-y py-3.5', className)}
      {...props}
    />
  )
})
