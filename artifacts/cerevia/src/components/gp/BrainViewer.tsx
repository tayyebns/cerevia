import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, MapPin, AlertCircle, Info } from 'lucide-react'
import type { MigraineEvent } from '@/lib/supabase/types'

// ── Sketchfab model ──────────────────────────────────────────────────────────
const MODEL_UID = 'c1518abfd4d64539b0cf093716e25d4c'
const SF_SCRIPT = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js'

// ── Brain region catalogue ───────────────────────────────────────────────────
// annotationIdx = 0-based index in the Sketchfab model's Annotations tab.
// If you add/reorder annotations in the Sketchfab editor, update these numbers.
export const BRAIN_REGIONS = [
  {
    annotationIdx: 0,
    name: 'Frontal Lobe',
    abbr: 'FL',
    color: '#68B8AF',
    role: 'Executive function · decision-making · motor planning',
    keywords: ['stress', 'anxiety', 'cognitive', 'concentration', 'focus', 'brain fog', 'mood', 'confusion', 'frontal'],
  },
  {
    annotationIdx: 1,
    name: 'Parietal Lobe',
    abbr: 'PL',
    color: '#8AB4D4',
    role: 'Sensory processing · spatial awareness · touch',
    keywords: ['tingling', 'numbness', 'touch', 'pressure', 'spatial', 'sensory', 'parietal', 'body awareness'],
  },
  {
    annotationIdx: 2,
    name: 'Temporal Lobe',
    abbr: 'TL',
    color: '#A09DD4',
    role: 'Auditory processing · memory · language',
    keywords: ['phonophobia', 'noise', 'sound', 'hearing', 'speech', 'language', 'memory', 'temporal', 'music', 'ringing'],
  },
  {
    annotationIdx: 3,
    name: 'Occipital Lobe',
    abbr: 'OL',
    color: '#C0526A',
    role: 'Visual cortex · primary aura site',
    keywords: ['aura', 'visual', 'vision', 'photophobia', 'bright', 'light', 'flicker', 'blind', 'eye', 'occipital', 'scintillating'],
  },
  {
    annotationIdx: 4,
    name: 'Cerebellum',
    abbr: 'CB',
    color: '#72AA79',
    role: 'Motor coordination · balance · posture',
    keywords: ['balance', 'coordination', 'dizziness', 'vertigo', 'motor', 'walk', 'ataxia', 'unsteady'],
  },
  {
    annotationIdx: 5,
    name: 'Brainstem',
    abbr: 'BS',
    color: '#E8A85A',
    role: 'Pain gating · nausea · autonomic regulation',
    keywords: ['nausea', 'vomit', 'sick', 'caffeine', 'dehydration', 'hunger', 'hormonal', 'weather', 'sleep', 'fatigue', 'autonomic', 'neck'],
  },
]

// ── TypeScript shim for Sketchfab window API ─────────────────────────────────
type SFClient = {
  init: (uid: string, opts: Record<string, unknown>) => void
}
type SFAPI = {
  start: () => void
  addEventListener: (event: string, cb: () => void) => void
  gotoAnnotation: (idx: number, opts?: Record<string, unknown>, cb?: () => void) => void
}
declare global {
  interface Window {
    Sketchfab: new (el: HTMLIFrameElement) => SFClient
  }
}

// ── Helper: derive primary brain region for one event ────────────────────────
function getPrimaryRegion(ev: MigraineEvent): number {
  if (ev.aura) return 3 // Aura is always occipital
  const haystack = [...(ev.triggers ?? []), ev.notes ?? ''].join(' ').toLowerCase()
  // Check in clinical priority order
  const priority = [3, 5, 0, 2, 1, 4]
  for (const idx of priority) {
    const r = BRAIN_REGIONS.find(r => r.annotationIdx === idx)!
    if (r.keywords.some(kw => haystack.includes(kw))) return idx
  }
  return ev.severity >= 8 ? 5 : 0
}

// ── Helper: derive ALL affected regions from a set of events ─────────────────
type RegionHit = (typeof BRAIN_REGIONS)[0] & { hitCount: number; reasons: string[] }

function buildAffectedRegions(events: MigraineEvent[]): RegionHit[] {
  const hits = new Map<number, { count: number; reasons: Set<string> }>()

  const addHit = (idx: number, reason: string) => {
    const entry = hits.get(idx) ?? { count: 0, reasons: new Set() }
    entry.count++
    entry.reasons.add(reason)
    hits.set(idx, entry)
  }

  events.forEach(ev => {
    const label = new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    if (ev.aura) addHit(3, `Visual aura (${label})`)
    if (ev.severity >= 8) addHit(5, `Severe pain ${ev.severity}/10 (${label})`)
    const haystack = [...(ev.triggers ?? []), ev.notes ?? ''].join(' ').toLowerCase()
    BRAIN_REGIONS.forEach(r => {
      if (r.keywords.some(kw => haystack.includes(kw))) addHit(r.annotationIdx, label)
    })
  })

  return [...hits.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([idx, { count, reasons }]) => ({
      ...BRAIN_REGIONS.find(r => r.annotationIdx === idx)!,
      hitCount: count,
      reasons: [...reasons].slice(0, 3),
    }))
}

// ── Component ────────────────────────────────────────────────────────────────
interface Props {
  events: MigraineEvent[]
  selectedEvent?: MigraineEvent | null
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export function BrainViewer({ events, selectedEvent }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const apiRef = useRef<SFAPI | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [tooltip, setTooltip] = useState<string | null>(null)

  const affectedRegions = useMemo(() => buildAffectedRegions(events), [events])
  const affectedIndices = useMemo(() => new Set(affectedRegions.map(r => r.annotationIdx)), [affectedRegions])

  // ── Load Sketchfab API script once ─────────────────────────────────────────
  useEffect(() => {
    if (window.Sketchfab) { setScriptReady(true); return undefined }
    if (document.querySelector(`script[src="${SF_SCRIPT}"]`)) {
      const check = setInterval(() => {
        if (window.Sketchfab) { setScriptReady(true); clearInterval(check) }
      }, 100)
      return () => clearInterval(check)
    }
    const s = document.createElement('script')
    s.src = SF_SCRIPT
    s.async = true
    s.onload = () => setScriptReady(true)
    s.onerror = () => setLoadState('error')
    document.head.appendChild(s)
    return undefined
  }, [])

  // ── Init viewer once script is ready ────────────────────────────────────────
  useEffect(() => {
    if (!scriptReady || !iframeRef.current || !window.Sketchfab) return
    setLoadState('loading')
    const client = new window.Sketchfab(iframeRef.current)
    client.init(MODEL_UID, {
      success: (api: SFAPI) => {
        api.start()
        api.addEventListener('viewerready', () => {
          apiRef.current = api
          setLoadState('ready')
        })
      },
      error: () => setLoadState('error'),
      ui_infos: 0,
      ui_controls: 0,
      ui_stop: 0,
      ui_help: 0,
      ui_settings: 0,
      ui_vr: 0,
      ui_fullscreen: 0,
      ui_annotations: 1,
      ui_watermark_link: 0,
      autostart: 1,
      preload: 1,
      dnt: 1,
    })
  }, [scriptReady])

  // ── Jump camera when selectedEvent changes ──────────────────────────────────
  useEffect(() => {
    if (!selectedEvent || loadState !== 'ready') return
    const regionIdx = getPrimaryRegion(selectedEvent)
    setActiveIdx(regionIdx)
    try { apiRef.current?.gotoAnnotation(regionIdx, { preventCameraAnimation: false }) } catch { /* no annotations */ }
  }, [selectedEvent, loadState])

  const handleRegionClick = (idx: number) => {
    setActiveIdx(idx)
    try { apiRef.current?.gotoAnnotation(idx, { preventCameraAnimation: false }) } catch { /* no annotations */ }
  }

  return (
    <div
      className="rounded-[24px] border overflow-hidden"
      style={{ background: '#132B28', borderColor: '#2E5E57', boxShadow: '0 4px 24px rgba(15,22,21,0.3)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#2E5E57' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(104,184,175,0.12)', border: '1px solid rgba(104,184,175,0.2)' }}>
            <Brain className="w-5 h-5" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: '#DCEEED' }}>
              Neural Impact Map
            </h2>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA' }}>
              3D brain - click a region or a timeline event to navigate
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(104,184,175,0.08)', border: '1px solid rgba(104,184,175,0.15)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: loadState === 'ready' ? '#72AA79' : loadState === 'error' ? '#C0526A' : '#E8A85A', animation: loadState === 'loading' ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 600, color: loadState === 'ready' ? '#72AA79' : '#8ABFBA' }}>
            {loadState === 'ready' ? 'Interactive' : loadState === 'loading' ? 'Loading model…' : loadState === 'error' ? 'Unavailable' : 'Initialising'}
          </span>
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="flex flex-col lg:flex-row" style={{ minHeight: 440 }}>

        {/* ── 3D viewer ── */}
        <div className="relative flex-1" style={{ minHeight: 380, minWidth: 280 }}>
          {/* Loading overlay */}
          <AnimatePresence>
            {(loadState === 'idle' || loadState === 'loading') && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
                style={{ background: '#0F1A19' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Brain className="w-14 h-14" style={{ color: '#68B8AF' }} strokeWidth={1} />
                </motion.div>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#8ABFBA' }}>Loading 3D brain model…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error overlay */}
          {loadState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: '#0F1A19' }}>
              <AlertCircle className="w-10 h-10" style={{ color: '#C0526A' }} strokeWidth={1.5} />
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#8ABFBA', textAlign: 'center', maxWidth: 200 }}>
                3D viewer couldn't load. Check your network and try refreshing.
              </p>
            </div>
          )}

          {/* Sketchfab iframe */}
          <iframe
            ref={iframeRef}
            id="cerevia-brain-viewer"
            title="Lobes of the Brain"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            style={{
              width: '100%',
              height: '100%',
              minHeight: 380,
              border: 'none',
              display: 'block',
              opacity: loadState === 'ready' ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
          />

          {/* Click-to-load prompt (idle) */}
          {loadState === 'idle' && (
            <button
              onClick={() => setScriptReady(true)}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#68B8AF', fontWeight: 600, padding: '8px 20px', background: 'rgba(104,184,175,0.12)', borderRadius: 999, border: '1px solid rgba(104,184,175,0.25)' }}>
                ▶ Load 3D model
              </span>
            </button>
          )}
        </div>

        {/* ── Region panel ── */}
        <div
          className="border-t lg:border-t-0 lg:border-l flex flex-col"
          style={{ width: '100%', maxWidth: '100%', borderColor: '#2E5E57' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #2E5E57' }}>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#8ABFBA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Affected regions
            </div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#4A8A85', marginTop: 2 }}>
              Derived from {events.length} logged episodes · click to navigate
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {affectedRegions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Brain className="w-8 h-8" style={{ color: '#2E5E57' }} strokeWidth={1} />
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#4A8A85' }}>
                  No episodes logged yet
                </p>
              </div>
            ) : (
              affectedRegions.map(region => {
                const isActive = activeIdx === region.annotationIdx
                const barPct = Math.min((region.hitCount / (affectedRegions[0]?.hitCount ?? 1)) * 100, 100)
                return (
                  <motion.button
                    key={region.annotationIdx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRegionClick(region.annotationIdx)}
                    onMouseEnter={() => setTooltip(region.role)}
                    onMouseLeave={() => setTooltip(null)}
                    className="w-full text-left rounded-[14px] p-3 transition-all relative"
                    style={{
                      background: isActive ? `${region.color}18` : '#1E433E',
                      border: `1px solid ${isActive ? region.color : '#265750'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      {/* Color dot */}
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: region.color, boxShadow: isActive ? `0 0 8px ${region.color}` : 'none' }} />
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 700, color: '#DCEEED', flex: 1 }}>{region.name}</span>
                      {/* Hit badge */}
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${region.color}22`, color: region.color, fontFamily: 'Nunito, sans-serif' }}>
                        ×{region.hitCount}
                      </span>
                    </div>

                    {/* Impact bar */}
                    <div className="h-1 rounded-full mb-2" style={{ background: '#132B28' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barPct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-1 rounded-full"
                        style={{ background: region.color, opacity: 0.8 }}
                      />
                    </div>

                    {/* Reasons */}
                    <div className="flex flex-wrap gap-1">
                      {region.reasons.map(r => (
                        <span key={r} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, color: '#8ABFBA', background: '#132B28', padding: '1px 6px', borderRadius: 999 }}>{r}</span>
                      ))}
                    </div>

                    {/* Navigate hint */}
                    <div className="flex items-center gap-1 mt-2" style={{ opacity: 0.5 }}>
                      <MapPin className="w-3 h-3" style={{ color: region.color }} />
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, color: region.color }}>
                        {loadState === 'ready' ? 'Click to navigate' : 'Load model to navigate'}
                      </span>
                    </div>
                  </motion.button>
                )
              })
            )}

            {/* Non-affected regions (dimmed) */}
            {affectedRegions.length > 0 && BRAIN_REGIONS
              .filter(r => !affectedIndices.has(r.annotationIdx))
              .map(region => (
                <button
                  key={region.annotationIdx}
                  onClick={() => handleRegionClick(region.annotationIdx)}
                  className="w-full text-left rounded-[14px] p-3"
                  style={{ background: 'transparent', border: '1px dashed #2E5E57', cursor: 'pointer', opacity: 0.45 }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: region.color }} />
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA' }}>{region.name}</span>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, color: '#4A8A85', marginLeft: 'auto' }}>Unaffected</span>
                  </div>
                </button>
              ))
            }
          </div>

          {/* Tooltip / role description */}
          <div className="px-4 py-3 border-t" style={{ borderColor: '#2E5E57', minHeight: 52 }}>
            <AnimatePresence mode="wait">
              {tooltip ? (
                <motion.div key="tip" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#68B8AF' }} />
                    <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#8ABFBA', lineHeight: 1.5 }}>{tooltip}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#4A8A85', lineHeight: 1.5 }}>
                  Hover a region for its clinical role. Regions are inferred from logged triggers, aura, and severity data.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Active event banner ── */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t overflow-hidden"
            style={{ borderColor: '#2E5E57' }}
          >
            <div className="px-6 py-3 flex items-center gap-4 flex-wrap" style={{ background: 'rgba(104,184,175,0.06)' }}>
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#68B8AF' }} />
              <div className="flex items-center gap-3 flex-wrap">
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, color: '#DCEEED' }}>
                  {new Date(selectedEvent.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}
                </span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA' }}>
                  Severity {selectedEvent.severity}/10{selectedEvent.aura ? ' · Aura' : ''}
                </span>
                {(selectedEvent.triggers ?? []).map(t => (
                  <span key={t} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, padding: '1px 8px', borderRadius: 999, background: '#1E433E', color: '#8ABFBA' }}>{t}</span>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: BRAIN_REGIONS.find(r => r.annotationIdx === activeIdx)?.color ?? '#68B8AF' }} />
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: BRAIN_REGIONS.find(r => r.annotationIdx === activeIdx)?.color ?? '#68B8AF' }}>
                  {BRAIN_REGIONS.find(r => r.annotationIdx === activeIdx)?.name ?? '-'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
