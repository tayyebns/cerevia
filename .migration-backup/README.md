# Cerevia

**AI-powered migraine management and consultation intelligence.**

Cerevia helps migraine patients track their symptoms, manage medications, and share a rich health picture with their GP before every appointment. Built for a hackathon, it demonstrates how thoughtful design and AI can make clinical conversations clearer and more productive for both patient and doctor.

---

## What it does

### For patients

- **Daily Care** -- log symptoms with severity scores, describe how you feel, and watch your trends over time on a filterable chart brr
- **Reminders** -- a morning, afternoon, and evening medication schedule with one-tap Taken/Skip tracking and a live adherence percentage
- **GP Bridge** -- generate a shareable access code and send your GP a structured summary of your recent symptoms, adherence, and voice notes before your appointment
- **Appointment Capture** -- record your consultation and get an automatic transcript, stored only on your device

### For GPs

A dedicated dark-mode dashboard designed for clinical review:

- Patient overview with condition, medications, and key stat cards (frequency, average severity, average duration, adherence)
- Episode frequency bar chart and severity trend area chart
- Trigger context breakdown showing the most common co-factors
- Medication effectiveness cards with adherence rates
- Full migraine event timeline with severity, duration, aura flags, and trigger chips
- **AI Consultation Copilot** -- a chat interface pre-loaded with an AI-generated patient summary, with context-aware answers about triggers, medications, and treatment progress

---

## Design principles

Cerevia was built around one non-negotiable constraint: it must be safe for photosensitive users.

- No red anywhere. Alerts use Soft Rose (#C0526A)
- No blinking or pulsing animations
- Minimum 44px tap targets (60px during acute episode states)
- Dark mode is a medical accommodation, not a preference. The GP dashboard uses a #132B28 surface with #DCEEED text at a 9:1 contrast ratio
- Short sentences, plain language, no forced positivity in clinical contexts

**Typography:** Cormorant Garamond for headings (calm, editorial), Nunito for body and UI (rounded, approachable).  
**Color:** Primary teal #68B8AF, accent sage #72AA79, app background #F7FAFA.  
**Components:** Pill buttons (999px radius), 28px card radius, 8px input radius.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Animation | Framer Motion (soft fades, 200-400ms only) |
| Icons | Lucide React |

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose Patient or GP to explore.

### Routes

| Path | View |
|---|---|
| `/` | Landing page |
| `/patient` | Patient home |
| `/patient/daily-care` | Symptom tracking |
| `/patient/gp-bridge` | Share with GP |
| `/patient/capture` | Appointment recorder |
| `/patient/reminders` | Medication schedule |
| `/gp` | GP dashboard |

---

## Demo data

All data is pre-populated in `lib/data.ts`. The demo patient is Maria, 34, living with Chronic Migraine with Aura. Her data covers 8 migraine events across 4 weeks with a clear improving trend over the final two weeks.

---

Built with care for people who live with migraine.
