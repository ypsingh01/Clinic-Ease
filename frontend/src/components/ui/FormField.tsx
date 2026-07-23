import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
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
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-text">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-danger text-xs" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-text-muted text-xs">{hint}</p>
      ) : null}
    </div>
  )
}

const controlBase =
  'w-full min-h-[44px] rounded-[10px] border border-border bg-surface px-3.5 text-[15px] text-text placeholder:text-text-muted transition-[border-color,box-shadow] duration-120 hover:border-primary/30 focus:border-primary focus:outline-none focus:shadow-[var(--focus-ring)] disabled:opacity-50'

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
      className={cn(controlBase, 'min-h-[96px] resize-y py-3', className)}
      {...props}
    />
  )
})
