'use client'
import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'rose'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-[999px] transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'h-9 px-4 text-sm',
        size === 'md' && 'h-11 px-6 text-[15px]',
        size === 'lg' && 'h-14 px-8 text-base',
        variant === 'primary' && 'bg-[#68B8AF] text-white shadow-[0_4px_16px_rgba(104,184,175,0.32)] hover:bg-[#4A9990] hover:-translate-y-px active:translate-y-0',
        variant === 'secondary' && 'border-[1.5px] border-[#68B8AF] text-[#68B8AF] bg-transparent hover:bg-[rgba(104,184,175,0.08)] hover:-translate-y-px',
        variant === 'ghost' && 'text-[#5A7271] bg-transparent hover:bg-[rgba(104,184,175,0.08)]',
        variant === 'rose' && 'bg-[#C0526A] text-white shadow-[0_4px_16px_rgba(192,82,106,0.24)] hover:bg-[#A8405A] hover:-translate-y-px',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
