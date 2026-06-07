'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Render a size-matched placeholder before mount to prevent layout shift
  if (!mounted) {
    return (
      <div
        style={{
          width: compact ? 36 : 96,
          height: 36,
          borderRadius: 999,
          background: 'var(--surface-2)',
        }}
      />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? 0 : 6,
        height: 36,
        padding: compact ? '0 10px' : '0 14px',
        borderRadius: 999,
        border: '1.5px solid var(--border)',
        background: 'var(--surface-2)',
        color: 'var(--text-muted)',
        fontFamily: 'Nunito, sans-serif',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {isDark
        ? <Sun  className="w-4 h-4" strokeWidth={1.5} style={{ color: '#68B8AF' }} />
        : <Moon className="w-4 h-4" strokeWidth={1.5} style={{ color: '#68B8AF' }} />}
      {!compact && (isDark ? 'Light' : 'Dark')}
    </button>
  )
}
