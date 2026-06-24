<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/* ════════════════════════════════════════════════════════════════
   Cronómetro de PCR — soporte de tiempo y fármacos en reanimación.
   Tiempo basado en timestamps absolutos (sin deriva ni al recargar).
   Persistencia en localStorage → sobrevive a recargas (acta de PCR).
═══════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'pcr-session-v1'
const CYCLE_MS = 120_000 // 2 min

interface PcrEvent {
  id: number
  type: 'adrenalina' | 'amiodarona' | 'atropina' | 'descarga' | 'farmaco' | 'nota'
  label: string
  detail?: string
  clock: number // epoch ms (hora real)
  pcrMs: number // ms desde activación
}

// Fármacos secundarios: se registran en el acta sin recordatorios de tiempo.
// Solo dejan constancia de la hora de administración.
const OTHER_MEDS = [
  'Lidocaína',
  'Bicarbonato sódico',
  'Sulfato de magnesio',
  'Gluconato cálcico',
  'Insulina',
  'Glucosa',
  'Fibrinólisis',
  'Naloxona',
  'Glucagón',
  'Sueroterapia',
] as const

// Causas reversibles de la PCR (4 H · 4 T) — recordatorio.
const CAUSES_H = [
  { k: 'Hipoxia', d: 'Asegurar vía aérea y oxigenación · comprobar capnografía' },
  { k: 'Hipovolemia', d: 'Reposición de volumen · control de hemorragia' },
  { k: 'Hidrogeniones / metabólico', d: 'Acidosis · hiper/hipopotasemia · hipoglucemia · hipocalcemia' },
  { k: 'Hipotermia', d: 'Temperatura central · recalentamiento si procede' },
]
const CAUSES_T = [
  { k: 'Neumotórax a tensión', d: 'Descompresión con aguja / toracostomía' },
  { k: 'Taponamiento cardíaco', d: 'Eco · pericardiocentesis' },
  { k: 'Tóxicos', d: 'Antídotos · naloxona · glucagón · bicarbonato' },
  { k: 'Trombosis', d: 'Coronaria (IAM) o pulmonar (TEP) · valorar fibrinólisis' },
]

// ── Estado persistente ────────────────────────────────────────────
const startedAtClock = ref<number | null>(null) // hora de activación (epoch)
const accumulatedMs = ref(0)                     // ms acumulados en pausas previas
const runStartTs = ref<number | null>(null)      // epoch del tramo en marcha (null = pausado)
const running = ref(false)
const events = ref<PcrEvent[]>([])
const counts = ref<Record<string, number>>({ adrenalina: 0, amiodarona: 0, descarga: 0 })
const otherCounts = ref<Record<string, number>>({}) // fármacos secundarios (sin recordatorio)
const showCauses = ref(false) // modal 4 H · 4 T
// Ciclo de RCP: cronómetro INDEPENDIENTE del tiempo total (pausable por
// reevaluación o ROSC sin detener el tiempo de parada).
const completedCycles = ref(0)
const cycleAccumMs = ref(0)
const cycleStartTs = ref<number | null>(null)
const cycleRunning = ref(false)
const rosc = ref(false) // ROSC: única situación que pausa el tiempo total
const pediatric = ref(false)
const weightKg = ref<number | null>(null)
const weightMode = ref<'manual' | 'age'>('manual') // peso real o estimado por edad
const ageYears = ref<number | null>(null)
const ageMonths = ref<number | null>(null)
let eventSeq = 0

// Peso estimado por edad (fórmulas APLS):
//   <1 año:   (0,5 × meses) + 4
//   1–5 años: (2 × años) + 8
//   ≥6 años:  (3 × años) + 7
const estimatedWeight = computed(() => {
  const totalMonths = (ageYears.value ?? 0) * 12 + (ageMonths.value ?? 0)
  if (totalMonths <= 0) return null
  const y = totalMonths / 12
  let kg: number
  if (totalMonths < 12) kg = 0.5 * totalMonths + 4
  else if (y <= 5) kg = 2 * y + 8
  else kg = 3 * y + 7
  return Math.round(kg * 10) / 10
})

// ── Ticker reactivo ───────────────────────────────────────────────
const now = ref(Date.now())
let ticker: number | undefined

function startTicker() {
  stopTicker()
  ticker = window.setInterval(() => {
    now.value = Date.now()
    checkCycle()
  }, 200)
}
function stopTicker() {
  if (ticker) { clearInterval(ticker); ticker = undefined }
}

const elapsedMs = computed(() =>
  accumulatedMs.value + (running.value && runStartTs.value ? now.value - runStartTs.value : 0)
)
// Ciclo independiente
const cycleElapsed = computed(() => {
  const base = cycleAccumMs.value + (cycleRunning.value && cycleStartTs.value ? now.value - cycleStartTs.value : 0)
  return Math.min(base, CYCLE_MS)
})
const cycleRemaining = computed(() => CYCLE_MS - cycleElapsed.value)
const cycleNumber = computed(() => completedCycles.value + 1)
const cycleProgress = computed(() => cycleElapsed.value / CYCLE_MS) // 0..1
const cycleDone = computed(() => !cycleRunning.value && cycleElapsed.value >= CYCLE_MS)
const cyclePaused = computed(() => !cycleRunning.value && cycleElapsed.value > 0 && cycleElapsed.value < CYCLE_MS)
const cycleFoot = computed(() => cycleDone.value ? 'reevaluar → siguiente' : cyclePaused.value ? 'ciclo en pausa' : 'para reevaluar')
const cycleBtnLabel = computed(() => cycleDone.value ? '▶ Siguiente ciclo' : cycleRunning.value ? '⏸ Pausar ciclo' : '▶ Reanudar ciclo')
const cycleBtnClass = computed(() => cycleDone.value ? 'cb-next' : cycleRunning.value ? 'cb-pause' : 'cb-resume')

const RING_R = 92
const RING_C = 2 * Math.PI * RING_R
const ringOffset = computed(() => RING_C * cycleProgress.value)

// ── Formato ───────────────────────────────────────────────────────
function fmtClock(epoch: number) {
  return new Date(epoch).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function fmtDur(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(h > 0 ? m : m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
const totalLabel = computed(() => fmtDur(elapsedMs.value))
const cycleLabel = computed(() => fmtDur(cycleRemaining.value))
const startedLabel = computed(() => startedAtClock.value ? fmtClock(startedAtClock.value) : '')

// ── Dosis según población ─────────────────────────────────────────
const w = computed(() => (pediatric.value && weightKg.value && weightKg.value > 0 ? weightKg.value : null))
function adrenalinaDose() {
  if (pediatric.value) return w.value ? `${round(0.01 * w.value, 2)} mg (10 mcg/kg)` : '10 mcg/kg'
  return '1 mg'
}
function amiodaronaDose(order: 1 | 2) {
  if (pediatric.value) return w.value ? `${round(5 * w.value, 0)} mg (5 mg/kg)` : '5 mg/kg'
  return order === 1 ? '300 mg' : '150 mg'
}
const descargaHint = computed(() => {
  if (!pediatric.value) return null
  return w.value ? `4 J/kg = ${round(4 * w.value, 0)} J` : '4 J/kg'
})
function round(n: number, d: number) { return parseFloat(n.toFixed(d)).toString().replace('.', ',') }

// ── Audio (Web Audio API) ─────────────────────────────────────────
let audioCtx: AudioContext | null = null
function ensureAudio() {
  try {
    if (!audioCtx) audioCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext)()
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()
  } catch { /* sin audio */ }
}
function beep(times = 3, freq = 880, dur = 0.18, gap = 0.1) {
  ensureAudio()
  if (!audioCtx) return
  let t = audioCtx.currentTime
  for (let i = 0; i < times; i++) {
    const osc = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    osc.type = 'square'
    osc.frequency.value = freq
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.8, t + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g); g.connect(audioCtx.destination)
    osc.start(t); osc.stop(t + dur)
    t += dur + gap
  }
}
function vibrate(pattern: number[]) { try { (navigator as any).vibrate?.(pattern) } catch { /* noop */ } }

// ── Alertas (pila: varias visibles a la vez, sin pisarse) ─────────
interface AlertItem { id: number; title: string; detail?: string; tone: 'reassess' | 'adrenalina' | 'shock' | 'rosc' | 'breaths' | 'vector' }
const alerts = ref<AlertItem[]>([])
let alertSeq = 0
function pushAlert(a: Omit<AlertItem, 'id'>, sound: () => void, vib: number[]) {
  alerts.value.push({ id: ++alertSeq, ...a })
  if (alerts.value.length > 4) alerts.value.shift()
  sound(); vibrate(vib)
}
function dismissAlert(id: number) { alerts.value = alerts.value.filter(a => a.id !== id) }

// ── Ciclo: fin automático al llegar a 0 (queda en espera para reevaluar) ──
function checkCycle() {
  if (!cycleRunning.value) return
  if (cycleElapsed.value >= CYCLE_MS) {
    cycleAccumMs.value = CYCLE_MS         // se mantiene a 00:00
    cycleStartTs.value = null
    cycleRunning.value = false            // NO reinicia solo: hay que reevaluar
    completedCycles.value++
    logEvent('nota', `Fin ciclo ${completedCycles.value}`, 'Reevaluar ritmo / pulso')
    pushAlert(
      { title: 'REEVALUAR RITMO / PULSO', detail: `Fin del ciclo ${completedCycles.value} · pulsa «Siguiente ciclo» tras reevaluar`, tone: 'reassess' },
      () => beep(3, 920, 0.2, 0.1), [250, 120, 250, 120, 250]
    )
    // Cada 2 ciclos → valorar adrenalina (banner aparte, apilado; pitido escalonado)
    if (completedCycles.value % 2 === 0) {
      pushAlert(
        { title: 'VALORAR ADRENALINA', detail: `Dosis: ${adrenalinaDose()} (cada 2 ciclos)`, tone: 'adrenalina' },
        () => setTimeout(() => beep(2, 660, 0.22, 0.12), 1300), [400, 150, 400]
      )
    }
    persist()
  }
}

// Botón principal del ciclo: pausar / reanudar / siguiente (según estado)
function cycleAction() {
  if (cycleDone.value) return startNextCycle()
  if (cycleRunning.value) {
    cycleAccumMs.value += cycleStartTs.value ? Date.now() - cycleStartTs.value : 0
    cycleStartTs.value = null
    cycleRunning.value = false
  } else {
    cycleStartTs.value = Date.now()
    cycleRunning.value = true
  }
  persist()
}
function startNextCycle() {
  cycleAccumMs.value = 0
  cycleStartTs.value = Date.now()
  cycleRunning.value = true
  persist()
}
function resetCycle() {
  cycleAccumMs.value = 0
  cycleStartTs.value = cycleRunning.value ? Date.now() : null
  persist()
}
function markRosc() {
  // ROSC: pausa el tiempo total Y detiene los ciclos.
  if (running.value) {
    accumulatedMs.value += runStartTs.value ? Date.now() - runStartTs.value : 0
    runStartTs.value = null
    running.value = false
  }
  if (cycleRunning.value) {
    cycleAccumMs.value += cycleStartTs.value ? Date.now() - cycleStartTs.value : 0
    cycleStartTs.value = null
    cycleRunning.value = false
  }
  rosc.value = true
  logEvent('nota', 'ROSC', 'Tiempo total en pausa')
  pushAlert({ title: 'ROSC', detail: 'Tiempo en pausa. Si recae, pulsa «Re-PCR».', tone: 'rosc' },
    () => beep(2, 1040, 0.16, 0.1), [120, 80, 120])
  persist()
}
function resumeArrest() {
  // Re-parada: reanuda el tiempo total y arranca un ciclo nuevo.
  rosc.value = false
  runStartTs.value = Date.now()
  running.value = true
  cycleAccumMs.value = 0
  cycleStartTs.value = Date.now()
  cycleRunning.value = true
  logEvent('nota', 'Re-parada', 'Se reanuda el tiempo total')
  beep(3, 880, 0.18, 0.1)
  persist()
}

// ── Acciones ──────────────────────────────────────────────────────
function startPcr() {
  ensureAudio()
  // Si el peso se estima por edad, fijarlo como peso de trabajo para las dosis
  if (pediatric.value && weightMode.value === 'age' && estimatedWeight.value) {
    weightKg.value = estimatedWeight.value
  }
  startedAtClock.value = Date.now()
  accumulatedMs.value = 0
  runStartTs.value = Date.now()
  running.value = true
  completedCycles.value = 0
  cycleAccumMs.value = 0
  cycleStartTs.value = Date.now()
  cycleRunning.value = true
  rosc.value = false
  alerts.value = []
  events.value = []
  counts.value = { adrenalina: 0, amiodarona: 0, descarga: 0 }
  otherCounts.value = {}
  eventSeq = 0
  logEvent('nota', 'PCR iniciada', pediatric.value ? `Pediátrico${w.value ? ' · ' + weightKg.value + ' kg' : ''}` : 'Adulto')
  startTicker()
  // RCP pediátrica: arranca con 5 ventilaciones de rescate
  if (pediatric.value) {
    logEvent('nota', '5 ventilaciones de rescate', 'Inicio de la reanimación pediátrica')
    pushAlert(
      { title: 'INICIAR 5 VENTILACIONES DE RESCATE', detail: 'Antes de las compresiones (RCP pediátrica)', tone: 'breaths' },
      () => beep(3, 720, 0.18, 0.1), [200, 100, 200, 100, 200]
    )
  }
  persist()
}
function resetPcr() {
  if (!confirm('¿Iniciar una PCR nueva? Se borrará el registro actual.')) return
  stopTicker()
  startedAtClock.value = null
  accumulatedMs.value = 0
  runStartTs.value = null
  running.value = false
  events.value = []
  counts.value = { adrenalina: 0, amiodarona: 0, descarga: 0 }
  otherCounts.value = {}
  completedCycles.value = 0
  cycleAccumMs.value = 0
  cycleStartTs.value = null
  cycleRunning.value = false
  rosc.value = false
  alerts.value = []
  localStorage.removeItem(STORAGE_KEY)
}

function logEvent(type: PcrEvent['type'], label: string, detail?: string) {
  events.value.unshift({ id: ++eventSeq, type, label, detail, clock: Date.now(), pcrMs: elapsedMs.value })
}

function giveMed(type: 'adrenalina' | 'amiodarona') {
  counts.value[type]++
  const n = counts.value[type]
  const dose = type === 'adrenalina' ? adrenalinaDose() : amiodaronaDose(n === 1 ? 1 : 2)
  const labelMap = { adrenalina: 'Adrenalina', amiodarona: 'Amiodarona' }
  logEvent(type, `${labelMap[type]} #${n}`, dose)
  beep(1, 520, 0.09)
  persist()
}

// Fármacos secundarios: solo registran la hora de administración (sin recordatorios).
function giveOtherMed(name: string) {
  otherCounts.value[name] = (otherCounts.value[name] ?? 0) + 1
  const n = otherCounts.value[name]
  logEvent('farmaco', `${name} #${n}`)
  beep(1, 520, 0.09)
  persist()
}

function shock() {
  counts.value.descarga++
  const n = counts.value.descarga
  logEvent('descarga', `Descarga #${n}`, descargaHint.value ?? undefined)
  beep(1, 440, 0.12)
  // Tras la descarga se reanuda RCP: el ciclo vuelve a empezar en 2:00
  cycleAccumMs.value = 0
  cycleStartTs.value = Date.now()
  cycleRunning.value = true
  // Recordatorios por nº de descarga
  if (n === 3) {
    pushAlert(
      { title: '3ª DESCARGA', detail: `1ª Amiodarona ${amiodaronaDose(1)} + Adrenalina ${adrenalinaDose()}`, tone: 'shock' },
      () => beep(3, 760, 0.2, 0.1), [300, 120, 300, 120, 300]
    )
    pushAlert(
      { title: 'PRUEBA A CAMBIAR EL VECTOR DE LOS PARCHES', detail: 'FV/TVSP refractaria: valora posición antero-posterior', tone: 'vector' },
      () => setTimeout(() => beep(2, 600, 0.22, 0.12), 1300), [250, 120, 250]
    )
  } else if (n === 5) {
    pushAlert(
      { title: '5ª DESCARGA', detail: `2ª Amiodarona ${amiodaronaDose(2)}`, tone: 'shock' },
      () => beep(3, 760, 0.2, 0.1), [300, 120, 300, 120, 300]
    )
  }
  persist()
}

// ── Copiar acta ───────────────────────────────────────────────────
const copied = ref(false)
async function copyLog() {
  const head = `ACTA PCR · activación ${startedLabel.value} · duración ${totalLabel.value}\n` +
    `Población: ${pediatric.value ? 'Pediátrico' + (weightKg.value ? ' (' + weightKg.value + ' kg)' : '') : 'Adulto'}\n` +
    `Descargas: ${counts.value.descarga} · Adrenalina: ${counts.value.adrenalina} · Amiodarona: ${counts.value.amiodarona}\n` +
    '─────────────────────────────\n'
  const lines = [...events.value].reverse()
    .map(e => `${fmtClock(e.clock)} (${fmtDur(e.pcrMs)})  ${e.label}${e.detail ? ' · ' + e.detail : ''}`)
    .join('\n')
  try {
    await navigator.clipboard.writeText(head + lines)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch { /* clipboard no disponible */ }
}

// ── Persistencia ──────────────────────────────────────────────────
function persist() {
  if (!startedAtClock.value) return
  const data = {
    startedAtClock: startedAtClock.value, accumulatedMs: accumulatedMs.value,
    runStartTs: runStartTs.value, running: running.value, events: events.value,
    counts: counts.value, otherCounts: otherCounts.value,
    completedCycles: completedCycles.value, cycleAccumMs: cycleAccumMs.value,
    cycleStartTs: cycleStartTs.value, cycleRunning: cycleRunning.value, rosc: rosc.value,
    pediatric: pediatric.value, weightKg: weightKg.value,
    weightMode: weightMode.value, ageYears: ageYears.value, ageMonths: ageMonths.value, eventSeq,
  }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* lleno */ }
}
function restore() {
  let raw: string | null = null
  try { raw = localStorage.getItem(STORAGE_KEY) } catch { return }
  if (!raw) return
  try {
    const d = JSON.parse(raw)
    if (!d?.startedAtClock) return
    startedAtClock.value = d.startedAtClock
    accumulatedMs.value = d.accumulatedMs ?? 0
    runStartTs.value = d.runStartTs ?? null
    running.value = !!d.running
    events.value = d.events ?? []
    counts.value = d.counts ?? { adrenalina: 0, amiodarona: 0, descarga: 0 }
    otherCounts.value = d.otherCounts ?? {}
    completedCycles.value = d.completedCycles ?? 0
    cycleAccumMs.value = d.cycleAccumMs ?? 0
    cycleStartTs.value = d.cycleStartTs ?? null
    cycleRunning.value = !!d.cycleRunning
    rosc.value = !!d.rosc
    pediatric.value = !!d.pediatric
    weightKg.value = d.weightKg ?? null
    weightMode.value = d.weightMode === 'age' ? 'age' : 'manual'
    ageYears.value = d.ageYears ?? null
    ageMonths.value = d.ageMonths ?? null
    eventSeq = d.eventSeq ?? events.value.length
    startTicker() // el ticker corre mientras haya PCR activa (total y/o ciclo)
  } catch { /* corrupto */ }
}

onMounted(restore)
onBeforeUnmount(stopTicker)
</script>

<template>
  <div class="pcr">
    <!-- ═══ Pantalla de inicio ═══ -->
    <div v-if="!startedAtClock" class="pcr-start">
      <div class="start-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      </div>
      <h1 class="start-title">Cronómetro de PCR</h1>
      <p class="start-sub">Control de tiempo, ciclos y fármacos en reanimación cardiopulmonar.</p>

      <div class="start-pop">
        <button class="pop-btn" :class="{ 'is-active': !pediatric }" @click="pediatric = false">Adulto</button>
        <button class="pop-btn" :class="{ 'is-active': pediatric }" @click="pediatric = true">Pediátrico</button>
      </div>
      <div v-if="pediatric" class="start-weight-block">
        <div class="weight-mode">
          <button class="wm-btn" :class="{ 'is-active': weightMode === 'manual' }" @click="weightMode = 'manual'">Peso real</button>
          <button class="wm-btn" :class="{ 'is-active': weightMode === 'age' }" @click="weightMode = 'age'">Estimar por edad</button>
        </div>
        <div v-if="weightMode === 'manual'" class="start-weight">
          <label for="pcr-w">Peso (kg)</label>
          <input id="pcr-w" v-model.number="weightKg" type="number" min="1" max="150" placeholder="kg" />
        </div>
        <div v-else class="start-age">
          <div class="age-fields">
            <div class="age-field">
              <label for="pcr-y">Años</label>
              <input id="pcr-y" v-model.number="ageYears" type="number" min="0" max="14" placeholder="0" />
            </div>
            <div class="age-field">
              <label for="pcr-m">Meses</label>
              <input id="pcr-m" v-model.number="ageMonths" type="number" min="0" max="11" placeholder="0" />
            </div>
          </div>
          <p v-if="estimatedWeight" class="age-estimate">Peso estimado: <strong>{{ estimatedWeight }} kg</strong></p>
          <p v-else class="age-estimate age-estimate--hint">Introduce la edad para estimar el peso</p>
        </div>
      </div>

      <button class="start-go" @click="startPcr">
        <span class="go-dot"></span> INICIAR PCR
      </button>
      <p class="start-note">Al iniciar se registra la hora y se activan los avisos sonoros (ciclos de 2 min).</p>
    </div>

    <!-- ═══ Tablero activo ═══ -->
    <template v-else>
      <header class="pcr-bar">
        <div class="bar-meta">
          <span class="bar-tag" :class="{ 'bar-tag--ped': pediatric }">{{ pediatric ? 'PED' : 'ADULTO' }}</span>
          <span class="bar-started">Iniciada <strong>{{ startedLabel }}</strong></span>
          <span v-if="pediatric && weightKg" class="bar-weight">{{ weightKg }} kg</span>
        </div>
        <div class="bar-actions">
          <button class="bar-btn bar-btn--causes" @click="showCauses = true">4 H · 4 T</button>
          <button class="bar-btn" @click="copyLog">{{ copied ? '✓ Copiado' : 'Copiar acta' }}</button>
          <button class="bar-btn bar-btn--danger" @click="resetPcr">Nueva PCR</button>
        </div>
      </header>

      <div class="pcr-body">
        <!-- Timers + acciones -->
        <section class="pcr-main">
          <div class="timers">
            <div class="total" :class="{ 'is-rosc': rosc }">
              <span class="total-label">Tiempo total de parada</span>
              <span class="total-value">{{ totalLabel }}</span>
              <span v-if="rosc" class="total-state">⏸ ROSC · tiempo en pausa</span>
            </div>

            <div class="cycle-block">
              <div class="cycle" :class="{ 'is-done': cycleDone, 'is-paused': cyclePaused }">
                <svg class="ring" viewBox="0 0 200 200">
                  <circle class="ring-bg" cx="100" cy="100" :r="RING_R" />
                  <circle
                    class="ring-fg" cx="100" cy="100" :r="RING_R"
                    :stroke-dasharray="RING_C" :stroke-dashoffset="ringOffset"
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div class="cycle-inner">
                  <span class="cycle-num">Ciclo {{ cycleNumber }}</span>
                  <span class="cycle-value">{{ cycleLabel }}</span>
                  <span class="cycle-foot">{{ cycleFoot }}</span>
                </div>
              </div>

              <div class="cycle-ctrls" v-if="!rosc">
                <button class="cycle-btn" :class="cycleBtnClass" @click="cycleAction">{{ cycleBtnLabel }}</button>
                <button class="cycle-reset" title="Reiniciar ciclo a 2:00" @click="resetCycle">↻</button>
                <button class="rosc-btn" title="ROSC: pausa el tiempo total y detiene los ciclos" @click="markRosc">ROSC</button>
              </div>
              <div class="rosc-state" v-else>
                <span class="rosc-tag"><span class="rosc-dot"></span> ROSC</span>
                <button class="rearrest-btn" title="Re-parada: reanuda el tiempo y arranca un ciclo" @click="resumeArrest">↺ Re-PCR</button>
              </div>
            </div>
          </div>

          <div class="meds">
            <button class="med med--adr" @click="giveMed('adrenalina')">
              <span class="med-name">Adrenalina</span>
              <span class="med-dose">{{ adrenalinaDose() }}</span>
              <span v-if="counts.adrenalina" class="med-count">{{ counts.adrenalina }}</span>
            </button>
            <button class="med med--ami" @click="giveMed('amiodarona')">
              <span class="med-name">Amiodarona</span>
              <span class="med-dose">{{ amiodaronaDose(counts.amiodarona === 0 ? 1 : 2) }}</span>
              <span v-if="counts.amiodarona" class="med-count">{{ counts.amiodarona }}</span>
            </button>
            <button class="med med--des" @click="shock">
              <span class="med-name">⚡ Descarga</span>
              <span class="med-dose">{{ descargaHint ?? 'Desfibrilación' }}</span>
              <span v-if="counts.descarga" class="med-count">{{ counts.descarga }}</span>
            </button>
          </div>

          <!-- Fármacos secundarios: solo registran la hora (sin recordatorios) -->
          <div class="meds-other">
            <div class="meds-other-head">
              <span class="meds-other-title">Otros fármacos</span>
              <span class="meds-other-note">registro de hora de administración</span>
            </div>
            <div class="meds-other-grid">
              <button v-for="m in OTHER_MEDS" :key="m" class="med-chip" @click="giveOtherMed(m)">
                <span class="chip-name">{{ m }}</span>
                <span v-if="otherCounts[m]" class="chip-count">{{ otherCounts[m] }}</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Registro -->
        <aside class="pcr-log">
          <div class="log-head">
            <h2>Registro</h2>
            <span class="log-count">{{ events.length }}</span>
          </div>
          <ul class="log-list">
            <li v-for="e in events" :key="e.id" class="log-item" :class="`log-item--${e.type}`">
              <span class="log-time">{{ fmtClock(e.clock) }}</span>
              <span class="log-pcr">{{ fmtDur(e.pcrMs) }}</span>
              <span class="log-label">{{ e.label }}<small v-if="e.detail"> · {{ e.detail }}</small></span>
            </li>
            <li v-if="!events.length" class="log-empty">Sin eventos todavía.</li>
          </ul>
        </aside>
      </div>

      <!-- ═══ Pila de avisos (apilados, todos visibles) ═══ -->
      <div v-if="alerts.length" class="pcr-alerts">
        <transition-group name="alert">
          <div v-for="a in alerts" :key="a.id" class="pcr-alert" :class="`pcr-alert--${a.tone}`" role="alert">
            <div class="alert-text">
              <span class="alert-title">{{ a.title }}</span>
              <span v-if="a.detail" class="alert-detail">{{ a.detail }}</span>
            </div>
            <button class="alert-ok" @click="dismissAlert(a.id)">OK</button>
          </div>
        </transition-group>
      </div>
    </template>

    <!-- ═══ Modal causas reversibles (4 H · 4 T) ═══ -->
    <transition name="modal">
      <div v-if="showCauses" class="causes-overlay" @click.self="showCauses = false">
        <div class="causes-modal" role="dialog" aria-modal="true" aria-label="Causas reversibles 4 H y 4 T">
          <header class="causes-head">
            <h2>Causas reversibles · 4 H · 4 T</h2>
            <button class="causes-close" aria-label="Cerrar" @click="showCauses = false">✕</button>
          </header>
          <div class="causes-body">
            <div class="causes-col causes-col--h">
              <span class="causes-col-title">4 H</span>
              <div v-for="c in CAUSES_H" :key="c.k" class="cause">
                <span class="cause-k">{{ c.k }}</span>
                <span class="cause-d">{{ c.d }}</span>
              </div>
            </div>
            <div class="causes-col causes-col--t">
              <span class="causes-col-title">4 T</span>
              <div v-for="c in CAUSES_T" :key="c.k" class="cause">
                <span class="cause-k">{{ c.k }}</span>
                <span class="cause-d">{{ c.d }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.pcr {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100dvh - var(--nav-height, 60px));
  padding: 1rem 1.1rem 1.5rem;
  box-sizing: border-box;
}

/* ── Inicio ── */
.pcr-start {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.85rem;
  padding-top: clamp(1.5rem, 8vh, 5rem);
  max-width: 460px;
  margin: 0 auto;
}
.start-icon {
  width: 64px; height: 64px; color: var(--color-critical);
  filter: drop-shadow(0 0 18px rgba(239, 68, 68, 0.5));
}
.start-icon svg { width: 100%; height: 100%; }
.start-title {
  font-family: var(--font-display); font-size: 2rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em; margin: 0;
  background: linear-gradient(135deg, #fca5a5, var(--color-critical));
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.start-sub { color: rgba(228, 239, 248, 0.6); font-size: 0.95rem; margin: 0; }

.start-pop {
  display: flex; gap: 4px; margin-top: 0.6rem;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(45,156,219,0.2);
  border-radius: 10px; padding: 4px;
}
.pop-btn {
  border: none; background: transparent; color: rgba(228,239,248,0.6);
  font-family: var(--font-display); font-weight: 600; font-size: 0.95rem;
  letter-spacing: 0.05em; text-transform: uppercase; padding: 0.5rem 1.4rem;
  border-radius: 7px; cursor: pointer; transition: all 0.15s;
}
.pop-btn.is-active { background: rgba(45,156,219,0.22); color: #bae6fd; }
.start-weight-block { display: flex; flex-direction: column; align-items: center; gap: 0.7rem; }
.weight-mode {
  display: flex; gap: 4px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(245,158,11,0.2);
  border-radius: 9px; padding: 3px;
}
.wm-btn {
  border: none; background: transparent; color: rgba(228,239,248,0.55);
  font-family: var(--font-display); font-weight: 600; font-size: 0.8rem;
  letter-spacing: 0.04em; text-transform: uppercase; padding: 0.4rem 1rem;
  border-radius: 6px; cursor: pointer; transition: all 0.15s;
}
.wm-btn.is-active { background: rgba(245,158,11,0.2); color: var(--neon-glow); }
.start-weight { display: flex; align-items: center; gap: 0.6rem; }
.start-weight label {
  font-family: var(--font-display); font-size: 0.8rem; letter-spacing: 0.05em;
  text-transform: uppercase; color: var(--color-subtitle);
}
.start-weight input { width: 120px; text-align: center; }
.start-age { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.age-fields { display: flex; gap: 0.9rem; }
.age-field { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.age-field label {
  font-family: var(--font-display); font-size: 0.72rem; letter-spacing: 0.05em;
  text-transform: uppercase; color: var(--color-subtitle);
}
.age-field input { width: 84px; text-align: center; }
.age-estimate { margin: 0; font-size: 0.9rem; color: rgba(228,239,248,0.7); }
.age-estimate strong { font-family: var(--font-mono); color: var(--neon-glow); font-size: 1.05rem; }
.age-estimate--hint { font-size: 0.78rem; color: rgba(228,239,248,0.4); }

.start-go {
  margin-top: 0.75rem;
  display: inline-flex; align-items: center; gap: 0.6rem;
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  border: 1px solid #f87171; color: #fff;
  font-family: var(--font-display); font-weight: 700; font-size: 1.4rem;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 1rem 2.5rem; border-radius: 12px; cursor: pointer;
  box-shadow: 0 0 32px rgba(239, 68, 68, 0.4); transition: all 0.18s;
}
.start-go:hover { transform: translateY(-2px); box-shadow: 0 0 48px rgba(239, 68, 68, 0.6); }
.go-dot {
  width: 12px; height: 12px; border-radius: 50%; background: #fff;
  box-shadow: 0 0 12px #fff; animation: pulse 1.4s infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
.start-note { font-size: 0.78rem; color: rgba(228,239,248,0.4); margin: 0.4rem 0 0; max-width: 340px; }

/* ── Barra ── */
.pcr-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 0.75rem; margin-bottom: 1rem;
  border-bottom: 1px solid rgba(239, 68, 68, 0.18);
}
.bar-meta { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.bar-tag {
  font-family: var(--font-display); font-size: 0.66rem; font-weight: 700;
  letter-spacing: 0.12em; color: #0a0a0a; background: var(--color-subtitle);
  padding: 0.12rem 0.45rem; border-radius: 4px;
}
.bar-tag--ped { background: var(--neon-orange); }
.bar-started { font-size: 0.88rem; color: rgba(228,239,248,0.7); }
.bar-started strong { color: var(--color-text); font-family: var(--font-mono); }
.bar-weight { font-family: var(--font-mono); font-size: 0.82rem; color: var(--neon-glow); }
.bar-actions { display: flex; gap: 0.5rem; }
.bar-btn {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(45,156,219,0.25);
  color: rgba(228,239,248,0.7); font-family: var(--font-display); font-weight: 600;
  font-size: 0.78rem; letter-spacing: 0.05em; text-transform: uppercase;
  padding: 0.45rem 0.9rem; border-radius: 7px; cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.bar-btn:hover { border-color: var(--color-primary); color: var(--color-text); }
.bar-btn--danger { border-color: rgba(239,68,68,0.4); color: #fca5a5; }
.bar-btn--danger:hover { background: rgba(239,68,68,0.12); border-color: #ef4444; color: #fff; }
.bar-btn--causes { border-color: rgba(245,158,11,0.45); color: var(--neon-glow); }
.bar-btn--causes:hover { background: rgba(245,158,11,0.14); border-color: var(--neon-orange); color: #fff; }

/* ── Cuerpo ── */
.pcr-body { display: grid; grid-template-columns: minmax(0,1fr) 320px; gap: 1.1rem; align-items: start; }
.pcr-main { display: flex; flex-direction: column; gap: 1.2rem; }

/* Timers */
.timers {
  display: grid; grid-template-columns: 1fr auto; gap: 1.25rem 1.75rem; align-items: center;
  background: linear-gradient(180deg, rgba(239,68,68,0.04), transparent 55%), var(--color-card-bg);
  border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-card);
  padding: 1.25rem 1.5rem; box-shadow: var(--shadow-card);
}
.total { display: flex; flex-direction: column; gap: 0.3rem; align-items: flex-start; }
.total-label {
  font-family: var(--font-display); font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase; color: rgba(228,239,248,0.45);
}
.total-value {
  font-family: var(--font-mono); font-size: clamp(3.2rem, 9vw, 5rem); font-weight: 700;
  line-height: 0.95; color: var(--color-text);
  text-shadow: 0 0 40px rgba(86, 204, 242, 0.25);
}

.total.is-rosc .total-value { color: #6ee7b7; text-shadow: 0 0 40px rgba(16,185,129,0.25); }
.total-state {
  margin-top: 0.3rem; font-family: var(--font-display); font-weight: 700;
  font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; color: #6ee7b7;
}

.cycle-block { display: flex; flex-direction: column; align-items: center; gap: 0.7rem; }
.cycle { position: relative; width: 150px; height: 150px; flex-shrink: 0; }
.ring { width: 100%; height: 100%; }
.ring-bg { fill: none; stroke: rgba(255,255,255,0.07); stroke-width: 9; }
.ring-fg {
  fill: none; stroke: var(--neon-orange); stroke-width: 9; stroke-linecap: round;
  transition: stroke-dashoffset 0.25s linear, stroke 0.3s ease;
  filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.5));
}
.cycle.is-done .ring-fg { stroke: #ef4444; filter: drop-shadow(0 0 8px rgba(239,68,68,0.6)); }
.cycle.is-paused .ring-fg { stroke: rgba(245, 158, 11, 0.4); filter: none; }
.cycle.is-done .cycle-value { color: #fca5a5; }
.cycle-inner {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 0.1rem;
}
.cycle-num {
  font-family: var(--font-display); font-size: 0.66rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--neon-glow);
}
.cycle-value { font-family: var(--font-mono); font-size: 1.85rem; font-weight: 700; color: var(--color-text); line-height: 1; }
.cycle-foot { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(228,239,248,0.4); }

.cycle-ctrls { display: flex; align-items: stretch; gap: 0.4rem; width: 100%; max-width: 230px; }
.cycle-btn {
  flex: 1; border: 1px solid; border-radius: 10px; cursor: pointer;
  font-family: var(--font-display); font-weight: 700; font-size: 0.92rem;
  letter-spacing: 0.04em; padding: 0.6rem 0.6rem; transition: all 0.15s; white-space: nowrap;
}
.cycle-btn.cb-pause  { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.45); color: var(--neon-glow); }
.cycle-btn.cb-pause:hover  { background: rgba(245,158,11,0.2); border-color: var(--neon-orange); }
.cycle-btn.cb-resume { background: rgba(45,156,219,0.1); border-color: rgba(45,156,219,0.45); color: #7dd3f0; }
.cycle-btn.cb-resume:hover { background: rgba(45,156,219,0.2); border-color: var(--color-primary); }
.cycle-btn.cb-next   { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.5); color: #6ee7b7; animation: nextPulse 1.1s infinite; }
.cycle-btn.cb-next:hover { background: rgba(16,185,129,0.22); border-color: #10b981; }
@keyframes nextPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } 50% { box-shadow: 0 0 0 4px rgba(16,185,129,0.18); } }

.cycle-reset {
  flex-shrink: 0; width: 42px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(45,156,219,0.25);
  color: rgba(228,239,248,0.6); border-radius: 10px; cursor: pointer;
  font-size: 1.1rem; transition: all 0.15s;
}
.cycle-reset:hover { border-color: var(--color-primary); color: var(--color-text); }

.rosc-btn {
  flex-shrink: 0;
  background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.4);
  color: #6ee7b7; border-radius: 10px; cursor: pointer;
  font-family: var(--font-display); font-weight: 700; font-size: 0.85rem;
  letter-spacing: 0.06em; padding: 0 0.85rem; transition: all 0.15s;
}
.rosc-btn:hover { background: rgba(16,185,129,0.18); border-color: #10b981; color: #fff; }

/* Estado ROSC: tiempo en pausa, botón de re-parada */
.rosc-state {
  display: flex; align-items: center; gap: 0.5rem; width: 100%; max-width: 230px;
}
.rosc-tag {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  font-family: var(--font-display); font-weight: 700; font-size: 0.9rem;
  letter-spacing: 0.06em; text-transform: uppercase; color: #6ee7b7;
  background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.4);
  border-radius: 10px; padding: 0.6rem 0.5rem;
}
.rosc-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: pulse 1.6s infinite; }
.rearrest-btn {
  flex-shrink: 0;
  background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.5);
  color: #fca5a5; border-radius: 10px; cursor: pointer;
  font-family: var(--font-display); font-weight: 700; font-size: 0.88rem;
  letter-spacing: 0.05em; padding: 0.6rem 1rem; transition: all 0.15s; white-space: nowrap;
}
.rearrest-btn:hover { background: rgba(239,68,68,0.22); border-color: #ef4444; color: #fff; }

/* Meds */
.meds { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; }
.med {
  position: relative; display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
  border-radius: 12px; cursor: pointer; padding: 1.1rem 0.75rem; min-height: 84px;
  background: var(--mb, rgba(45,156,219,0.08)); border: 1px solid var(--mbd, rgba(45,156,219,0.4));
  transition: transform 0.12s, box-shadow 0.15s, background 0.15s;
}
.med:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.4); }
.med:active { transform: translateY(0) scale(0.98); }
.med-name {
  font-family: var(--font-display); font-weight: 700; font-size: 1.1rem;
  letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text);
}
.med-dose { font-family: var(--font-mono); font-size: 0.82rem; color: var(--mc, var(--color-subtitle)); }
.med-count {
  position: absolute; top: 8px; right: 10px; min-width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: #0a0a0a;
  background: var(--mc, var(--color-subtitle)); border-radius: 11px; padding: 0 0.3rem;
}
.med--adr { --mb: rgba(245,158,11,0.1); --mbd: rgba(245,158,11,0.45); --mc: var(--neon-glow); }
.med--ami { --mb: rgba(129,140,248,0.1); --mbd: rgba(129,140,248,0.45); --mc: #a5b4fc; }
.med--des { --mb: rgba(239,68,68,0.12); --mbd: rgba(239,68,68,0.5); --mc: #fca5a5; }

/* Fármacos secundarios (registro sin recordatorio) */
.meds-other {
  background: var(--color-card-bg); border: 1px solid var(--color-card-border);
  border-radius: var(--radius-card); padding: 0.9rem 1rem 1rem;
}
.meds-other-head { display: flex; align-items: baseline; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.7rem; }
.meds-other-title {
  font-family: var(--font-display); font-weight: 700; font-size: 0.82rem;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-subtitle);
}
.meds-other-note { font-size: 0.72rem; color: rgba(228,239,248,0.4); }
.meds-other-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; }
.med-chip {
  position: relative; display: flex; align-items: center; justify-content: center;
  min-height: 46px; padding: 0.55rem 0.7rem; cursor: pointer;
  background: rgba(56,189,248,0.06); border: 1px solid rgba(56,189,248,0.28);
  border-radius: 9px; transition: transform 0.12s, background 0.15s, border-color 0.15s;
}
.med-chip:hover { background: rgba(56,189,248,0.14); border-color: rgba(56,189,248,0.55); transform: translateY(-1px); }
.med-chip:active { transform: translateY(0) scale(0.98); }
.chip-name {
  font-family: var(--font-display); font-weight: 600; font-size: 0.84rem;
  letter-spacing: 0.02em; color: rgba(228,239,248,0.9); text-align: center; line-height: 1.1;
}
.chip-count {
  position: absolute; top: -7px; right: -7px; min-width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.74rem; font-weight: 700; color: #0a0a0a;
  background: #38bdf8; border-radius: 10px; padding: 0 0.3rem;
}

/* ── Modal causas reversibles (4 H · 4 T) ── */
.causes-overlay {
  position: fixed; inset: 0; z-index: 600;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
  background: rgba(3, 8, 16, 0.72); backdrop-filter: blur(4px);
}
.causes-modal {
  width: min(94vw, 720px); max-height: 88dvh; overflow-y: auto;
  background: var(--color-card-bg); border: 1px solid rgba(245,158,11,0.3);
  border-radius: var(--radius-card); box-shadow: 0 24px 70px rgba(0,0,0,0.6);
}
.causes-head {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: 1rem 1.25rem; border-bottom: 1px solid rgba(245,158,11,0.18);
  position: sticky; top: 0; background: var(--color-card-bg); border-radius: var(--radius-card) var(--radius-card) 0 0;
}
.causes-head h2 {
  margin: 0; font-family: var(--font-display); font-size: 1rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--neon-glow);
}
.causes-close {
  flex-shrink: 0; width: 34px; height: 34px; border-radius: 8px; cursor: pointer;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.15);
  color: rgba(228,239,248,0.7); font-size: 1rem; transition: all 0.15s;
}
.causes-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
.causes-body { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; padding: 1.25rem; }
.causes-col { display: flex; flex-direction: column; gap: 0.6rem; }
.causes-col-title {
  font-family: var(--font-display); font-weight: 700; font-size: 1.4rem;
  letter-spacing: 0.06em; padding-bottom: 0.3rem; border-bottom: 2px solid;
}
.causes-col--h .causes-col-title { color: #56ccf2; border-color: rgba(86,204,242,0.4); }
.causes-col--t .causes-col-title { color: var(--neon-glow); border-color: rgba(245,158,11,0.4); }
.cause { display: flex; flex-direction: column; gap: 0.15rem; padding: 0.5rem 0.65rem; border-radius: 8px; background: rgba(255,255,255,0.025); }
.cause-k { font-family: var(--font-display); font-weight: 700; font-size: 0.95rem; letter-spacing: 0.02em; color: var(--color-text); }
.cause-d { font-size: 0.8rem; color: rgba(228,239,248,0.6); line-height: 1.3; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* Registro */
.pcr-log {
  background: var(--color-card-bg); border: 1px solid var(--color-card-border);
  border-radius: var(--radius-card); box-shadow: var(--shadow-card);
  display: flex; flex-direction: column; max-height: calc(100dvh - var(--nav-height, 60px) - 6rem);
}
.log-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1rem; border-bottom: 1px solid rgba(45,156,219,0.15);
}
.log-head h2 {
  margin: 0; font-family: var(--font-display); font-size: 0.82rem; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-subtitle);
}
.log-count {
  font-family: var(--font-mono); font-size: 0.75rem; color: rgba(228,239,248,0.5);
  background: rgba(45,156,219,0.1); border-radius: 10px; padding: 0.1rem 0.5rem;
}
.log-list { list-style: none; margin: 0; padding: 0.4rem; overflow-y: auto; }
.log-item {
  display: grid; grid-template-columns: auto auto 1fr; gap: 0.5rem; align-items: baseline;
  padding: 0.4rem 0.5rem; border-radius: 7px; border-left: 2px solid transparent;
}
.log-item::before { display: none; }
.log-item:nth-child(odd) { background: rgba(255,255,255,0.02); }
.log-time { font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-text); }
.log-pcr { font-family: var(--font-mono); font-size: 0.7rem; color: rgba(228,239,248,0.4); }
.log-label { font-size: 0.82rem; color: rgba(228,239,248,0.85); }
.log-label small { color: rgba(228,239,248,0.5); }
.log-item--adrenalina { border-left-color: var(--neon-orange); }
.log-item--amiodarona { border-left-color: #818cf8; }
.log-item--atropina { border-left-color: #34d399; }
.log-item--farmaco { border-left-color: #38bdf8; }
.log-item--descarga { border-left-color: #ef4444; }
.log-item--nota { border-left-color: rgba(45,156,219,0.5); }
.log-empty { padding: 1rem; text-align: center; color: rgba(228,239,248,0.4); font-size: 0.85rem; }
.log-empty::before { display: none; }

/* ── Pila de alertas ── */
.pcr-alerts {
  position: fixed; left: 50%; bottom: 1.25rem; transform: translateX(-50%);
  z-index: 500; display: flex; flex-direction: column; gap: 0.6rem;
  width: min(92vw, 560px);
}
.pcr-alert {
  display: flex; align-items: center; gap: 1.25rem;
  width: 100%; padding: 0.9rem 1.2rem; border-radius: 14px;
  box-shadow: 0 16px 50px rgba(0,0,0,0.6);
  border: 1.5px solid; backdrop-filter: blur(12px);
  animation: alertFlash 0.9s ease-in-out infinite alternate;
}
@keyframes alertFlash { from { box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 0 transparent; } to { box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 6px var(--flash, rgba(239,68,68,0.25)); } }
.pcr-alert--reassess   { background: rgba(40, 14, 14, 0.96); border-color: #ef4444; --flash: rgba(239,68,68,0.3); }
.pcr-alert--adrenalina { background: rgba(40, 26, 6, 0.96); border-color: var(--neon-orange); --flash: rgba(245,158,11,0.3); }
.pcr-alert--shock      { background: rgba(30, 20, 40, 0.96); border-color: #a78bfa; --flash: rgba(167,139,250,0.3); }
.pcr-alert--rosc       { background: rgba(8, 32, 24, 0.96); border-color: #10b981; --flash: rgba(16,185,129,0.3); }
.pcr-alert--breaths    { background: rgba(6, 28, 38, 0.96); border-color: #38bdf8; --flash: rgba(56,189,248,0.3); }
.pcr-alert--vector     { background: rgba(34, 20, 40, 0.96); border-color: #c084fc; --flash: rgba(192,132,252,0.32); }
.alert-text { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; }
.alert-title {
  font-family: var(--font-display); font-weight: 700; font-size: 1.15rem;
  letter-spacing: 0.06em; text-transform: uppercase; color: #fff;
}
.alert-detail { font-size: 0.88rem; color: rgba(255,255,255,0.78); }
.alert-ok {
  flex-shrink: 0; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.3);
  color: #fff; font-family: var(--font-display); font-weight: 700; font-size: 0.9rem;
  letter-spacing: 0.08em; padding: 0.55rem 1.3rem; border-radius: 9px; cursor: pointer; transition: all 0.15s;
}
.alert-ok:hover { background: rgba(255,255,255,0.22); }
.alert-enter-active, .alert-leave-active { transition: opacity 0.2s, transform 0.2s; }
.alert-enter-from, .alert-leave-to { opacity: 0; transform: translateY(12px); }
.alert-leave-active { position: absolute; width: 100%; }
.alert-move { transition: transform 0.2s; }

/* ── Responsive ── */
@media (max-width: 880px) {
  .pcr-body { grid-template-columns: 1fr; }
  .timers { grid-template-columns: 1fr; justify-items: center; text-align: center; gap: 1.25rem; }
  .total { align-items: center; }
  .pcr-log { max-height: none; }
}
@media (max-width: 560px) {
  .causes-body { grid-template-columns: 1fr; gap: 1rem; }
}
@media (max-width: 480px) {
  .total-value { font-size: 3rem; }
}
</style>
