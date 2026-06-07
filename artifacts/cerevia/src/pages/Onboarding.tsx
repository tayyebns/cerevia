import { useState } from 'react'
import { useLocation } from 'wouter'
import { loadDemoData } from '@/lib/demo/store'

const ENCOURAGEMENT = [
  'You are doing a great job.',
  'Almost there - keep it up.',
  'You are doing brilliantly.',
  'Nearly done - you should be proud.',
  'Keep going - this is all for you.',
  'Just a couple more - you are doing great.',
  'Last one! You have done amazingly.',
]

const STEPS = [
  {
    id: 'goals',
    question: 'What would you like help with?',
    hint: 'Select all that apply',
    multi: true,
    options: [
      'Energy crashes',
      'Sleep routine',
      'Feeling overwhelmed',
      'Burnout prevention',
      'Focus and productivity',
      'Daily routines',
      'Understanding my patterns',
      'General wellbeing',
    ],
  },
  {
    id: 'profile',
    question: 'Which of the following best describes your experience?',
    hint: 'Select all that apply',
    multi: true,
    options: [
      'ADHD',
      'Autism / ASC',
      'ADHD + Autism (AuDHD)',
      'Dyslexia',
      'Dyspraxia / DCD',
      'Dyscalculia',
      'Tourette Syndrome',
      'Sensory Processing Differences',
      'Executive Function Difficulties',
      'Learning Disability',
      'Other Neurodivergence',
      'Exploring / Undiagnosed',
      'None of the above',
      'Prefer not to say',
    ],
  },
  {
    id: 'support',
    question: 'How much guidance would you like?',
    hint: 'Choose one',
    multi: false,
    options: ['Minimal', 'Balanced', 'High Support'],
    descriptions: {
      Minimal: 'Only important insights',
      Balanced: 'One insight per day',
      'High Support': 'Insights, reminders and routine support',
    } as Record<string, string>,
  },
  {
    id: 'bad_day',
    question: 'What does a bad day usually look like for you?',
    hint: 'Select all that apply',
    multi: true,
    options: [
      'Very low energy',
      'Overwhelmed',
      'Shutdown',
      'Burnout',
      'Difficulty focusing',
      'Difficulty starting tasks',
      'Anxiety',
      'Poor sleep',
      'Forgetting essentials',
      'Sensory overload',
      'Irritability',
      'Social exhaustion',
    ],
  },
  {
    id: 'devices',
    question: 'Which devices do you use?',
    hint: 'Select all that apply',
    multi: true,
    options: [
      'Apple Watch',
      'Samsung Watch',
      'Fitbit',
      'Garmin',
      'Oura Ring',
      'WHOOP',
      'None yet',
    ],
  },
  {
    id: 'goal',
    question: 'What would make Astra successful for you?',
    hint: 'Choose one',
    multi: false,
    options: [
      'Fewer low-energy days',
      'Better sleep',
      'More consistent routines',
      'Less overwhelm',
      'Better focus',
      'Understanding my body better',
      'Avoiding burnout',
      'More predictable days',
    ],
  },
  {
    id: 'notifications',
    question: 'How often would you like notifications?',
    hint: 'Choose one',
    multi: false,
    options: [
      'Only important changes',
      'Once daily',
      'A few times per week',
      'Never',
    ],
  },
]

type Answers = Record<string, string[]>

export default function Onboarding() {
  const [, navigate] = useLocation()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})

  const current = STEPS[step]
  const selected = answers[current.id] ?? []
  const progress = ((step) / STEPS.length) * 100

  function toggle(option: string) {
    setAnswers(prev => {
      const cur = prev[current.id] ?? []
      if (current.multi) {
        return {
          ...prev,
          [current.id]: cur.includes(option)
            ? cur.filter(o => o !== option)
            : [...cur, option],
        }
      } else {
        return { ...prev, [current.id]: [option] }
      }
    })
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      loadDemoData()
      navigate('/app/patterns')
    }
  }

  const canContinue = selected.length > 0

  return (
    <div style={{
      minHeight: '100svh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 16px 40px',
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: 520,
        paddingTop: 24,
        paddingBottom: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <a href="/" style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text)', textDecoration: 'none' }}>
          Astra
        </a>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {step + 1} of {STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 520, height: 3, background: 'var(--border-color)', borderRadius: 99, marginBottom: 32 }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--brand)',
          borderRadius: 99,
          transition: 'width 0.35s ease',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Encouragement */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--brand)',
          marginBottom: 8,
          letterSpacing: '0.02em',
        }}>
          {ENCOURAGEMENT[step]}
        </p>

        {/* Question */}
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(22px, 5vw, 28px)',
          fontWeight: 400,
          color: 'var(--text)',
          lineHeight: 1.3,
          marginBottom: 6,
        }}>
          {current.question}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
          {current.hint}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {current.options.map(option => {
            const isSelected = selected.includes(option)
            const desc = (current as any).descriptions?.[option]
            return (
              <button
                key={option}
                onClick={() => toggle(option)}
                style={{
                  display: 'flex',
                  alignItems: desc ? 'flex-start' : 'center',
                  gap: 12,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: `1.5px solid ${isSelected ? 'var(--brand)' : 'var(--border-color)'}`,
                  background: isSelected ? 'var(--brand-light)' : 'var(--card-bg)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                  width: '100%',
                }}
              >
                {/* Checkbox / radio indicator */}
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: current.multi ? 6 : '50%',
                  border: `2px solid ${isSelected ? 'var(--brand)' : 'var(--border-color)'}`,
                  background: isSelected ? 'var(--brand)' : 'transparent',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: desc ? 2 : 0,
                  transition: 'border-color 0.15s, background 0.15s',
                }}>
                  {isSelected && (
                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                      <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span>
                  <span style={{
                    fontSize: 15,
                    fontWeight: isSelected ? 600 : 400,
                    color: 'var(--text)',
                    display: 'block',
                    lineHeight: 1.3,
                  }}>
                    {option}
                  </span>
                  {desc && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                      {desc}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {/* Continue */}
        <div style={{ marginTop: 32, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={next}
            disabled={!canContinue}
            style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: 12,
              border: 'none',
              background: canContinue ? 'var(--brand)' : 'var(--border-color)',
              color: canContinue ? '#fff' : 'var(--text-muted)',
              fontSize: 15,
              fontWeight: 600,
              cursor: canContinue ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {step === STEPS.length - 1 ? 'See your patterns' : 'Continue'}
          </button>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                border: '1.5px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Back
            </button>
          )}
        </div>

        {step < STEPS.length - 1 && (
          <button
            onClick={next}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '10px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Skip this question
          </button>
        )}
      </div>
    </div>
  )
}
