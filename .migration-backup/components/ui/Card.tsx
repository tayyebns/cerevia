import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  tinted?: boolean
}

export function Card({ children, className, tinted = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-[#DDE9E8] shadow-[0_4px_24px_rgba(15,22,21,0.08)]',
        tinted ? 'bg-[#EEF5F5]' : 'bg-white',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pt-6 pb-4', className)}>{children}</div>
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>
}
