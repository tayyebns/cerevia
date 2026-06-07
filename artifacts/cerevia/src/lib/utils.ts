import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function severityLabel(score: number): string {
  if (score <= 2) return 'Very mild'
  if (score <= 4) return 'Mild'
  if (score <= 6) return 'Moderate'
  if (score <= 8) return 'Severe'
  return 'Very severe'
}

export function severityColor(score: number): string {
  if (score <= 2) return '#72AA79'
  if (score <= 4) return '#68B8AF'
  if (score <= 6) return '#E8A85A'
  if (score <= 8) return '#C0526A'
  return '#8B2240'
}
