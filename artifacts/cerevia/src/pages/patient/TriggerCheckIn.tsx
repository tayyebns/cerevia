import { useState } from 'react'
import { useLocation } from 'wouter'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Brain, Droplets, Utensils, Coffee, MonitorSmartphone, Activity, CheckCircle2, CloudRain, HeartPulse } from 'lucide-react'
import { addCheckin } from '@/lib/demo/store'

function Slider({ label, value, min, max, step, unit, onChange, hint }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void; hint?: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: '#68B8AF' }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full" style={{ accentColor: '#68B8AF' }}
      />
      {hint && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>{hint}</div>}
    </div>
  )
}

function Card({ icon: Icon, color, children }: { icon: typeof Moon; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border p-4 flex gap-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}1F` }}>
        <Icon className="w-4.5 h-4.5" strokeWidth={1.5} style={{ color, width: 18, height: 18 }} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
      style={{ fontFamily: 'Nunito, sans-serif', background: value ? '#68B8AF' : 'var(--bg)', color: value ? 'white' : 'var(--text-subtle)', border: '1px solid var(--border)', cursor: 'pointer' }}>
      {label}
    </button>
  )
}

export default function TriggerCheckIn() {
  const [, setLocation] = useLocation()
  const [sleepHours, setSleepHours] = useState(7)
  const [sleepQuality, setSleepQuality] = useState(3)
  const [stressLevel, setStressLevel] = useState(4)
  const [hydration, setHydration] = useState(3)
  const [mealsSkipped, setMealsSkipped] = useState(0)
  const [caffeineIntake, setCaffeineIntake] = useState(2)
  const [screenTimeHours, setScreenTimeHours] = useState(6)
  const [activityLevel, setActivityLevel] = useState(2)
  const [weatherSensitivity, setWeatherSensitivity] = useState(false)
  const [hormonalRelated, setHormonalRelated] = useState(false)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    addCheckin({
      sleepHours, sleepQuality, stressLevel, hydration, mealsSkipped,
      caffeineIntake, screenTimeHours, activityLevel, weatherSensitivity,
      hormonalRelated, notes: notes.trim() || undefined,
    })
    setSaved(true)
    setTimeout(() => setLocation('/patient/insights'), 1100)
  }

  return (
    <div className="px-5 py-4 space-y-4">
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: 'var(--text)', marginBottom: 2 }}>Trigger Check-In</h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-subtle)' }}>Help Cerevia understand today's migraine risk factors.</p>
      </div>

      <Card icon={Moon} color="#6B7CC4">
        <Slider label="Sleep duration" value={sleepHours} min={0} max={12} step={0.5} unit="h" onChange={setSleepHours} hint="Nights under 6h tend to raise risk for you." />
        <div className="mt-3">
          <Slider label="Sleep quality" value={sleepQuality} min={1} max={5} step={1} unit="/5" onChange={setSleepQuality} />
        </div>
      </Card>

      <Card icon={Brain} color="#C0526A">
        <Slider label="Stress level" value={stressLevel} min={1} max={10} step={1} unit="/10" onChange={setStressLevel} hint="7+ is a higher-risk day." />
      </Card>

      <Card icon={Droplets} color="#68B8AF">
        <Slider label="Hydration" value={hydration} min={1} max={5} step={1} unit="/5" onChange={setHydration} />
      </Card>

      <Card icon={Utensils} color="#E8A85A">
        <Slider label="Meals skipped" value={mealsSkipped} min={0} max={3} step={1} onChange={setMealsSkipped} />
      </Card>

      <Card icon={Coffee} color="#8B6F47">
        <Slider label="Caffeine (cups)" value={caffeineIntake} min={0} max={6} step={1} onChange={setCaffeineIntake} hint="Big changes either way can matter - consistency helps." />
      </Card>

      <Card icon={MonitorSmartphone} color="#6B7CC4">
        <Slider label="Screen time" value={screenTimeHours} min={0} max={16} step={0.5} unit="h" onChange={setScreenTimeHours} />
      </Card>

      <Card icon={Activity} color="#72AA79">
        <Slider label="Activity / exercise" value={activityLevel} min={1} max={5} step={1} unit="/5" onChange={setActivityLevel} />
      </Card>

      <Card icon={CloudRain} color="#6B7CC4">
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Other factors today</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Toggle label="Weather sensitivity" value={weatherSensitivity} onChange={setWeatherSensitivity} />
          <Toggle label="Hormonal / cycle" value={hormonalRelated} onChange={setHormonalRelated} />
        </div>
      </Card>

      <Card icon={HeartPulse} color="#68B8AF">
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Notes (optional)</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything notable about today…"
          className="w-full px-3 py-2 text-sm rounded-lg border resize-none"
          style={{ fontFamily: 'Nunito, sans-serif', borderColor: 'var(--border)', outline: 'none', color: 'var(--text)', minHeight: 56, background: 'var(--bg)' }} />
      </Card>

      <button onClick={handleSave} disabled={saved}
        className="w-full flex items-center justify-center gap-2 rounded-[999px] h-14 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)', boxShadow: '0 4px 16px rgba(104,184,175,0.4)', fontFamily: 'Nunito, sans-serif', fontSize: 16, border: 'none', cursor: saved ? 'default' : 'pointer' }}>
        {saved ? <><CheckCircle2 className="w-5 h-5" strokeWidth={2} /> Saved - updating your profile…</> : "Save today's check-in"}
      </button>

      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-[14px]" style={{ background: 'rgba(114,170,121,0.14)' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#4A7A50' }} />
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, color: '#4A7A50' }}>
              Check-in saved. Cerevia is recalculating your trigger profile.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center', lineHeight: 1.5 }}>
        Your check-ins build a personal trigger pattern over time - they are not a medical assessment.
      </p>
    </div>
  )
}
