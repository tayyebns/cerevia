'use client'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'teal' | 'sage' | 'rose' | 'muted' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'teal', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variant === 'teal' && 'bg-[#EEF5F5] text-[#4A9990]',
        variant === 'sage' && 'bg-[#EEF5EE] text-[#4A7A50]',
        variant === 'rose' && 'bg-[#FCEEF1] text-[#C0526A]',
        variant === 'muted' && 'bg-[#F0F4F4] text-[#5A7271]',
        variant === 'outline' && 'border border-[#DDE9E8] text-[#5A7271] bg-transparent',
        className
      )}
    >
      {children}
    </span>
  )
}
