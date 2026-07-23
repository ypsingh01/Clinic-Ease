import { Link } from 'react-router-dom'
import { BrandMark, BrandWordmark } from './BrandMark'
import { cn } from '@/lib/cn'

export function Logo({
  className,
  markOnly = false,
  to = '/',
}: {
  className?: string
  markOnly?: boolean
  to?: string
}) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5 no-underline', className)}>
      <BrandMark size={36} />
      {!markOnly ? <BrandWordmark size="sm" /> : null}
    </Link>
  )
}
