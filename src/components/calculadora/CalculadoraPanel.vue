<script setup lang="ts">
import { computed, ref } from 'vue'
import { FARMACOS } from '../../data/farmacos'
import medicamentos from '../../collections/medicamentos_normalizados.json'
import type { Farmaco } from '../../stores/calculadora'
import { useCalculadoraStore, VOLUMENES_SUERO } from '../../stores/calculadora'
import { formatMg } from '../../utils/unitConverter'
import type { MassUnit, TimeUnit } from '../../utils/unitConverter'

const store = useCalculadoraStore()
const allFarmacos = Object.values(FARMACOS) as Farmaco[]

// La dosis pediátrica vive en el dataset normalizado (no en data/farmacos.ts).
// Lo cruzamos por nombre para mostrarla en el modal de "Dosis de referencia".
const PLACEHOLDER = /^[\s\-–—.]*$/
const pediatricaPorNombre = new Map<string, string>()
for (const m of medicamentos as Array<{ nombre: string; dosis?: string[] }>) {
  const linea = (m.dosis ?? []).find((d) => typeof d === 'string' && /pedi/i.test(d))
  if (!linea) continue
  const texto = linea.slice(linea.indexOf(':') + 1).trim()
  if (texto && !PLACEHOLDER.test(texto)) pediatricaPorNombre.set(m.nombre.trim().toUpperCase(), texto)
}
const pediatricaText = computed<string | null>(() => {
  const n = store.farmacoSeleccionado?.nombre?.trim().toUpperCase()
  return n ? (pediatricaPorNombre.get(n) ?? null) : null
})

// ── Fármaco search ──────────────────────────────────────────────────
const searchTerm = ref(store.farmacoBuscado ?? '')
const showDropdown = ref(false)
const dosisModal = ref<HTMLDialogElement | null>(null)

const filteredFarmacos = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (term.length < 2) return []
  const starts   = allFarmacos.filter(f => f.nombre.toLowerCase().startsWith(term))
  const contains = allFarmacos.filter(f => !f.nombre.toLowerCase().startsWith(term) && f.nombre.toLowerCase().includes(term))
  return [...starts, ...contains].slice(0, 12)
})

function selectFarmaco(f: Farmaco) {
  store.seleccionarFarmaco(f)
  searchTerm.value = f.nombre
  showDropdown.value = false
}

function onInput() {
  showDropdown.value = true
  if (!searchTerm.value.trim()) {
    store.farmacoSeleccionado = null
    store.farmacoPresentacion = null
  }
}
function onBlur() { setTimeout(() => { showDropdown.value = false }, 180) }

// ── Paciente ────────────────────────────────────────────────────────
const PRESETS = [40, 50, 60, 70, 80, 90, 100, 110]
function stepWeight(delta: number) {
  store.pacientePeso = Math.max(1, Math.min(300, (store.pacientePeso ?? 70) + delta))
}

// ── Dosis controls ──────────────────────────────────────────────────
const massUnits: { value: MassUnit; label: string }[] = [
  { value: 'mcg', label: 'mcg' },
  { value: 'mg',  label: 'mg'  },
  { value: 'g',   label: 'g'   },
  { value: 'UI',  label: 'UI'  },
]
const timeUnits: { value: TimeUnit; label: string }[] = [
  { value: 'bolo', label: 'Bolo'  },
  { value: 'min',  label: '/min'  },
  { value: 'h',    label: '/hora' },
]

// ── Fármaco derived labels ──────────────────────────────────────────
const mgPorUnidadLabel = computed(() =>
  store.farmacoMgPorUnidad !== null ? formatMg(store.farmacoMgPorUnidad) : null
)
const totalLabel = computed(() => store.farmacoTotalMg > 0 ? formatMg(store.farmacoTotalMg) : null)
const tipoBadgeClass = (tipo: string) =>
  tipo === 'bolo' ? 'badge-bolo' : tipo === 'perfusion' ? 'badge-perf' : 'badge-otros'

// ── Resultado ───────────────────────────────────────────────────────
const res = computed(() => store.resultado)
const rateLabel = computed(() => {
  if (!res.value.isValid) return '—'
  if (res.value.mlPerHour !== null)  return res.value.mlPerHour.toFixed(1)
  if (res.value.mlForBolus !== null) return res.value.mlForBolus.toFixed(2)
  return '—'
})
const rateUnit = computed(() => {
  if (!res.value.isValid) return ''
  if (res.value.mlPerHour  !== null) return 'ml / h'
  if (res.value.mlForBolus !== null) return 'ml (bolo)'
  return ''
})
const concLabel = computed(() => {
  const c = res.value.concentrationMgMl
  if (!c || c <= 0) return null
  if (c < 0.001) return `${(c * 1_000_000).toFixed(1)} mcg/ml`
  if (c < 1)     return `${(c * 1000).toFixed(2)} mcg/ml`
  return `${c.toFixed(4)} mg/ml`
})
const mgHLabel = computed(() => {
  const mg = res.value.requiredMgPerHour
  return mg ? formatMg(mg) + '/h' : null
})
const preparacionLabel = computed(() =>
  store.farmacoTotalMg > 0 ? `${formatMg(store.farmacoTotalMg)} en ${store.sueroVolumen} ml` : null
)

function resetAll() {
  store.reset()
  searchTerm.value = ''
}
</script>

<template>
  <div class="calc-screen">
    <!-- Toolbar -->
    <header class="calc-bar">
      <div class="calc-bar-text">
        <h1 class="calc-title">Calculadora de Perfusión <span class="beta">Beta</span></h1>
        <p class="calc-sub">Herramienta de apoyo · siempre verificar · MadRescue112</p>
      </div>
      <button class="reset-btn" @click="resetAll" aria-label="Reiniciar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="13" height="13">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.35"/>
        </svg>
        Reiniciar
      </button>
    </header>

    <div class="calc-layout">
      <!-- ═══ INPUTS ═══ -->
      <div class="calc-inputs">
       <div class="input-col">
        <!-- Suero -->
        <section class="ipanel ipanel--suero">
          <div class="ipanel-head">
            <svg class="ip-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span>Suero / Diluyente</span>
          </div>
          <div class="ipanel-body">
            <p class="flabel">Volumen de bolsa</p>
            <div class="vol-grid">
              <button
                v-for="v in VOLUMENES_SUERO"
                :key="v"
                class="vol-btn"
                :class="{ 'is-active': store.sueroVolumen === v }"
                @click="store.sueroVolumen = (v as any)"
              >{{ v }}<small> ml</small></button>
            </div>
          </div>
        </section>

        <!-- Paciente -->
        <section class="ipanel ipanel--paciente">
          <div class="ipanel-head">
            <svg class="ip-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="7" r="4"/><path d="M5.2 22a8 8 0 0 1 13.6 0"/>
            </svg>
            <span>Paciente</span>
          </div>
          <div class="ipanel-body">
            <p class="flabel">Peso corporal (kg)</p>
            <div class="weight-row">
              <button class="step-btn" @click="stepWeight(-5)" title="-5 kg">−5</button>
              <button class="step-btn" @click="stepWeight(-1)">−</button>
              <input v-model.number="store.pacientePeso" type="number" min="1" max="300" class="weight-input" aria-label="Peso en kg" />
              <button class="step-btn" @click="stepWeight(1)">+</button>
              <button class="step-btn" @click="stepWeight(5)" title="+5 kg">+5</button>
            </div>
            <div class="preset-grid">
              <button
                v-for="kg in PRESETS"
                :key="kg"
                class="preset-btn"
                :class="{ 'is-active': store.pacientePeso === kg }"
                @click="store.pacientePeso = kg"
              >{{ kg }}</button>
            </div>
          </div>
        </section>

       </div>

       <div class="input-col">
        <!-- Fármaco -->
        <section class="ipanel ipanel--farmaco">
          <div class="ipanel-head">
            <svg class="ip-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/><circle cx="18" cy="18" r="3"/><path d="m22 22-1.5-1.5"/>
            </svg>
            <span>Fármaco</span>
          </div>
          <div class="ipanel-body">
            <p class="flabel">Buscar fármaco</p>
            <div class="search-wrap">
              <input
                v-model="searchTerm" type="text" class="finput" placeholder="Escribe el nombre…"
                autocomplete="off" spellcheck="false"
                @input="onInput" @focus="showDropdown = true" @blur="onBlur"
              />
              <transition name="fade">
                <ul v-if="showDropdown && filteredFarmacos.length" class="drug-dropdown" role="listbox">
                  <li
                    v-for="f in filteredFarmacos" :key="f.nombre" class="drug-item" role="option"
                    @mousedown.prevent="selectFarmaco(f)"
                  >{{ f.nombre }}</li>
                </ul>
              </transition>
            </div>

            <template v-if="store.farmacoSeleccionado">
              <div class="farmaco-cols">
                <div>
                  <p class="flabel top-gap">Presentación</p>
                  <select v-model="store.farmacoPresentacion" class="fselect">
                    <option
                      v-for="p in store.farmacoSeleccionado.presentaciones"
                      :key="`${p.cantidad.valor}${p.cantidad.unidad}${p.forma}`" :value="p"
                    >{{ p.forma }} · {{ p.cantidad.valor }} {{ p.cantidad.unidad }}<template v-if="p.volumen"> / {{ p.volumen.valor }} {{ p.volumen.unidad }}</template></option>
                  </select>
                  <div v-if="store.farmacoPresentacion" class="pres-chip">
                    <span class="pres-qty">{{ store.farmacoPresentacion.cantidad.valor }} {{ store.farmacoPresentacion.cantidad.unidad }}</span>
                    <span v-if="store.farmacoPresentacion.volumen" class="pres-vol">en {{ store.farmacoPresentacion.volumen.valor }} {{ store.farmacoPresentacion.volumen.unidad }}</span>
                    <span v-if="mgPorUnidadLabel" class="pres-mg-tag">{{ mgPorUnidadLabel }}/ud</span>
                  </div>
                </div>

                <div>
                  <p class="flabel top-gap">Cantidad a añadir a la bolsa</p>
                  <div class="mass-row">
                    <input
                      v-model.number="store.farmacoMasaValor" type="number" min="0" step="any"
                      class="mass-val" placeholder="0" aria-label="Cantidad de fármaco" @wheel.prevent
                    />
                    <div class="unit-btns">
                      <button
                        v-for="u in (['mcg','mg','g','UI'] as const)" :key="u"
                        :class="['unit-btn', { 'is-active': store.farmacoMasaUnidad === u }]"
                        @click="store.farmacoMasaUnidad = u"
                      >{{ u }}</button>
                    </div>
                  </div>
                  <p v-if="store.farmacoEquivalenteUnidades !== null" class="equiv-hint">
                    ≈ {{ store.farmacoEquivalenteUnidades }} ud. de la presentación
                  </p>
                </div>
              </div>

              <div class="farmaco-foot">
                <div v-if="totalLabel" class="total-row">
                  <span class="total-label">Total en bolsa</span>
                  <strong class="total-value">{{ totalLabel }}</strong>
                </div>
                <button
                  v-if="store.farmacoSeleccionado.dosis?.length"
                  class="dosis-btn" @click="dosisModal?.showModal()"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Dosis de referencia
                </button>
              </div>
            </template>
          </div>
        </section>

        <!-- Pauta -->
        <section class="ipanel ipanel--dosis">
          <div class="ipanel-head">
            <svg class="ip-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Pauta / Dosis deseada</span>
          </div>
          <div class="ipanel-body">
            <div class="pauta-grid">
              <div class="pauta-dose">
                <p class="flabel">Dosis</p>
                <div class="dose-row">
                  <input v-model.number="store.dosisValor" type="number" min="0" step="0.1" class="dose-input" placeholder="0.0" />
                  <span class="unit-badge">{{ store.dosisUnidadLabel }}</span>
                </div>
              </div>
              <div>
                <p class="flabel">Unidad de masa</p>
                <div class="seg-ctrl">
                  <button
                    v-for="u in massUnits" :key="u.value" class="seg-btn"
                    :class="{ 'is-active': store.dosisMasaUnidad === u.value }"
                    @click="store.dosisMasaUnidad = u.value"
                  >{{ u.label }}</button>
                </div>
              </div>
              <div>
                <p class="flabel">Modalidad</p>
                <div class="seg-ctrl">
                  <button
                    v-for="t in timeUnits" :key="t.value" class="seg-btn"
                    :class="{ 'is-active': store.dosisTiempoUnidad === t.value }"
                    @click="store.dosisTiempoUnidad = t.value"
                  >{{ t.label }}</button>
                </div>
              </div>
            </div>
            <button
              class="toggle-btn" :class="{ 'is-on': store.dosisPorKg }"
              @click="store.dosisPorKg = !store.dosisPorKg"
            >
              <span class="toggle-pill"><span class="toggle-dot" :class="{ 'is-on': store.dosisPorKg }"></span></span>
              Dosis ponderada por kg
            </button>
          </div>
        </section>
       </div>
      </div>

      <!-- ═══ RESULTADO ═══ -->
      <aside class="calc-output">
        <div class="result-card" :class="{ 'is-valid': res.isValid }">
          <div class="result-head" :class="{ 'is-valid': res.isValid }">
            <svg class="ip-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span>Ritmo de infusión</span>
            <span v-if="res.isValid" class="ready-dot"></span>
          </div>

          <div v-if="res.error" class="pending">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="34" height="34">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p class="pending-msg">{{ res.error }}</p>
          </div>

          <div v-else class="result-body">
            <div class="rate">
              <div class="rate-value">{{ rateLabel }}</div>
              <div class="rate-unit">{{ rateUnit }}</div>
            </div>
            <div class="metrics">
              <div v-if="concLabel" class="metric"><span class="m-key">Concentración</span><span class="m-val">{{ concLabel }}</span></div>
              <div v-if="mgHLabel" class="metric"><span class="m-key">Dosis/hora</span><span class="m-val">{{ mgHLabel }}</span></div>
              <div v-if="res.gtasPerMin !== null" class="metric"><span class="m-key">Macrogotero</span><span class="m-val">{{ res.gtasPerMin.toFixed(1) }} gtas/min</span></div>
              <div v-if="preparacionLabel" class="metric"><span class="m-key">Preparación</span><span class="m-val m-val--prep">{{ preparacionLabel }}</span></div>
            </div>
            <div v-if="res.warnings.length" class="warnings">
              <div v-for="w in res.warnings" :key="w" class="warn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" style="flex-shrink:0">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                {{ w }}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- ═══ MODAL: Dosis de referencia ═══ -->
    <dialog ref="dosisModal" class="dosis-modal">
      <h2>Dosis de referencia<template v-if="store.farmacoSeleccionado"> · {{ store.farmacoSeleccionado.nombre }}</template></h2>
      <div class="dosis-list">
        <div
          v-for="d in store.farmacoSeleccionado?.dosis ?? []"
          :key="d.tipo + d.descripcion"
          class="dosis-item"
        >
          <span :class="['dosis-badge', tipoBadgeClass(d.tipo)]">{{ d.tipo }}</span>
          <p class="dosis-desc">{{ d.descripcion }}</p>
        </div>

        <!-- Dosis pediátrica (dataset normalizado) — siempre visible -->
        <div v-if="store.farmacoSeleccionado" class="dosis-item dosis-item--ped">
          <span class="dosis-badge dosis-badge--ped">Pediátrica</span>
          <p class="dosis-desc" :class="{ 'dosis-desc--empty': !pediatricaText }">
            {{ pediatricaText ?? 'No especificada' }}
          </p>
        </div>
      </div>
      <form method="dialog" class="dosis-foot">
        <button class="btn">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
.calc-screen {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0.7rem;
  height: calc(100dvh - var(--nav-height, 60px));
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.7rem 1.1rem 0.85rem;
  box-sizing: border-box;
  overflow: hidden;
}

/* ── Toolbar ── */
.calc-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(45, 156, 219, 0.14);
}
.calc-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0;
  line-height: 1;
  text-align: left;
  -webkit-text-fill-color: initial;
  background: none;
}
.beta {
  font-size: 0.62rem;
  color: var(--neon-glow);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 4px;
  padding: 0.1rem 0.35rem;
  vertical-align: middle;
  letter-spacing: 0.1em;
}
.calc-sub { font-size: 0.72rem; color: rgba(125, 180, 200, 0.45); margin: 0.3rem 0 0; }

.reset-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(45, 156, 219, 0.2);
  color: rgba(125, 180, 210, 0.7);
  padding: 0.45rem 0.9rem; border-radius: 7px; cursor: pointer;
  font-size: 0.78rem; font-weight: 600;
  font-family: var(--font-display); letter-spacing: 0.06em; text-transform: uppercase;
  transition: all 0.15s; white-space: nowrap; flex-shrink: 0;
}
.reset-btn:hover { background: rgba(45, 156, 219, 0.1); border-color: rgba(45, 156, 219, 0.4); color: #7dd3f0; }

/* ── Layout ── */
.calc-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 0.8rem;
  height: 100%;
  min-height: 0;
}
.calc-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  min-height: 0;
}
.input-col {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  min-height: 0;
  overflow-y: auto;
}

/* ── Input panels ── */
.ipanel {
  background:
    linear-gradient(180deg, rgba(45, 156, 219, 0.03), transparent 55%),
    var(--color-card-bg);
  border: 1px solid var(--accent-dim, rgba(45, 156, 219, 0.22));
  border-top: 2px solid var(--accent, #2d9cdb);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}
.ipanel--suero    { --accent: #2d9cdb; --accent-dim: rgba(45, 156, 219, 0.22); }
.ipanel--farmaco  { --accent: #818cf8; --accent-dim: rgba(129, 140, 248, 0.22); }
.ipanel--paciente { --accent: #34d399; --accent-dim: rgba(52, 211, 153, 0.22); }
.ipanel--dosis    { --accent: #a78bfa; --accent-dim: rgba(167, 139, 250, 0.22); }

.ipanel-head {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-family: var(--font-display); font-weight: 700; font-size: 0.8rem;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--accent);
}
.ip-ico { width: 14px; height: 14px; flex-shrink: 0; }
.ipanel-body { padding: 0.7rem 0.9rem; display: flex; flex-direction: column; gap: 0.4rem; }

.flabel {
  font-size: 0.64rem; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(150, 190, 220, 0.5); margin: 0 0 0.3rem;
}
.top-gap { margin-top: 0.3rem; }

/* ── Suero ── */
.vol-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.35rem; }
.vol-btn {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(45, 156, 219, 0.17);
  color: rgba(150, 210, 235, 0.7); padding: 0.6rem 0.2rem; border-radius: 7px;
  cursor: pointer; font-size: 1rem; font-weight: 700; font-family: var(--font-display);
  display: flex; align-items: center; justify-content: center; gap: 0.1rem;
  transition: all 0.14s; line-height: 1;
}
.vol-btn small { font-size: 0.62rem; font-weight: 400; opacity: 0.65; }
.vol-btn:hover { background: rgba(45, 156, 219, 0.1); border-color: rgba(45, 156, 219, 0.4); color: #7dd3f0; }
.vol-btn.is-active { background: rgba(45, 156, 219, 0.2); border-color: #2d9cdb; color: #bae6fd; box-shadow: 0 0 8px rgba(45,156,219,0.22); }

/* ── Paciente ── */
.weight-row { display: flex; align-items: center; gap: 0.3rem; }
.step-btn {
  background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.22);
  color: #6ee7b7; min-width: 34px; height: 44px; border-radius: 7px; cursor: pointer;
  font-size: 0.85rem; font-weight: 700; font-family: var(--font-display);
  display: flex; align-items: center; justify-content: center; transition: all 0.13s;
  flex-shrink: 0; padding: 0 0.4rem;
}
.step-btn:hover { background: rgba(52, 211, 153, 0.2); border-color: #34d399; }
.weight-input {
  flex: 1; text-align: center; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(52, 211, 153, 0.22); color: #6ee7b7;
  padding: 0.4rem 0.3rem; border-radius: 7px; font-size: 1.5rem; font-weight: 700;
  font-family: var(--font-mono); outline: none; height: 44px; min-width: 0;
}
.weight-input:focus { border-color: #34d399; box-shadow: none; }
.preset-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.32rem; margin-top: 0.55rem; }
.preset-btn {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(52, 211, 153, 0.14);
  color: rgba(110, 231, 183, 0.6); padding: 0.42rem 0.2rem; border-radius: 6px;
  cursor: pointer; font-size: 0.88rem; font-weight: 600; font-family: var(--font-display); transition: all 0.13s;
}
.preset-btn:hover { background: rgba(52, 211, 153, 0.1); border-color: rgba(52, 211, 153, 0.35); color: #6ee7b7; }
.preset-btn.is-active { background: rgba(52, 211, 153, 0.18); border-color: #34d399; color: #a7f3d0; }

/* ── Fármaco ── */
.search-wrap { position: relative; z-index: 10; }
.finput {
  width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(129, 140, 248, 0.28);
  color: rgba(200, 210, 255, 0.95); padding: 0.55rem 0.65rem; border-radius: 7px;
  font-size: 0.92rem; font-family: var(--font-family); outline: none; box-sizing: border-box; height: auto;
}
.finput:focus { border-color: #818cf8; box-shadow: none; }
.finput::placeholder { color: rgba(165, 180, 252, 0.3); }
.drug-dropdown {
  position: absolute; top: calc(100% + 3px); left: 0; right: 0; z-index: 1000;
  list-style: none; margin: 0; padding: 0; background: #0c1826;
  border: 1px solid rgba(129, 140, 248, 0.38); border-radius: 8px;
  max-height: 240px; overflow-y: auto; box-shadow: 0 12px 28px rgba(0,0,0,0.65);
}
.drug-item {
  padding: 0.55rem 0.8rem; cursor: pointer; font-size: 0.85rem;
  color: rgba(190, 205, 255, 0.85); border-bottom: 1px solid rgba(129, 140, 248, 0.1); transition: background 0.1s;
}
.drug-item::before { display: none; }
.drug-item:last-child { border-bottom: none; }
.drug-item:hover { background: rgba(129, 140, 248, 0.18); color: #a5b4fc; }

.farmaco-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 1rem; }
.fselect {
  width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(129, 140, 248, 0.22);
  color: #a5b4fc; padding: 0.5rem 0.6rem; border-radius: 7px; font-size: 0.85rem;
  font-family: var(--font-family); cursor: pointer; outline: none; height: auto;
}
.fselect:focus { border-color: #818cf8; box-shadow: none; }
.pres-chip {
  display: flex; flex-wrap: wrap; gap: 0.3rem; align-items: center; font-size: 0.76rem;
  background: rgba(129, 140, 248, 0.07); border: 1px solid rgba(129, 140, 248, 0.15);
  border-radius: 6px; padding: 0.35rem 0.55rem; margin-top: 0.4rem;
}
.pres-qty { color: rgba(185, 195, 255, 0.78); font-weight: 600; }
.pres-vol { color: rgba(165, 175, 240, 0.5); }
.pres-mg-tag {
  margin-left: auto; background: rgba(129, 140, 248, 0.2); color: #a5b4fc;
  padding: 0.08rem 0.4rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; font-family: var(--font-mono);
}
.mass-row { display: flex; align-items: stretch; gap: 0.4rem; }
.mass-val {
  flex: 1; min-width: 0; background: rgba(255,255,255,0.04); border: 1px solid rgba(129, 140, 248, 0.28);
  color: rgba(200, 210, 255, 0.95); padding: 0.5rem 0.6rem; border-radius: 7px;
  font-size: 1.1rem; font-weight: 700; font-family: var(--font-mono); outline: none; text-align: right; height: auto;
}
.mass-val:focus { border-color: #818cf8; box-shadow: none; }
.unit-btns { display: flex; gap: 3px; flex-shrink: 0; }
.unit-btn {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(129, 140, 248, 0.2);
  color: rgba(165, 180, 252, 0.5); border-radius: 5px; cursor: pointer;
  font-size: 0.7rem; font-weight: 700; font-family: var(--font-mono); padding: 0 0.55rem; transition: all 0.12s;
}
.unit-btn:hover { background: rgba(129, 140, 248, 0.14); color: #a5b4fc; border-color: rgba(129,140,248,0.4); }
.unit-btn.is-active { background: rgba(129, 140, 248, 0.25); border-color: #818cf8; color: #c7d2fe; }
.equiv-hint { font-size: 0.68rem; color: rgba(165, 180, 252, 0.4); margin: 0.4rem 0 0; font-style: italic; }

.farmaco-foot { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.85rem; flex-wrap: wrap; }
.total-row {
  display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 160px;
  background: rgba(129, 140, 248, 0.12); border: 1px solid rgba(129, 140, 248, 0.28);
  border-radius: 7px; padding: 0.5rem 0.8rem;
}
.total-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(165, 180, 252, 0.6); }
.total-value { font-family: var(--font-mono); font-size: 1rem; font-weight: 700; color: #a5b4fc; margin-left: auto; }
.dosis-btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  background: rgba(129, 140, 248, 0.08); border: 1px solid rgba(129, 140, 248, 0.32);
  color: #a5b4fc; padding: 0.55rem 0.9rem; border-radius: 7px; cursor: pointer;
  font-family: var(--font-display); font-weight: 600; font-size: 0.8rem;
  letter-spacing: 0.05em; text-transform: uppercase; transition: all 0.15s; white-space: nowrap;
}
.dosis-btn:hover { background: rgba(129, 140, 248, 0.2); border-color: #818cf8; color: #c7d2fe; }

/* ── Pauta ── */
.pauta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.55rem 0.8rem; align-items: end; }
.pauta-dose { grid-column: 1 / -1; }
.dose-row { display: flex; align-items: center; gap: 0.4rem; }
.dose-input {
  flex: 1; min-width: 0; background: rgba(255,255,255,0.04); border: 1px solid rgba(167, 139, 250, 0.28);
  color: #c4b5fd; padding: 0.5rem 0.55rem; border-radius: 7px; font-size: 1.2rem; font-weight: 700;
  font-family: var(--font-mono); outline: none; height: auto;
}
.dose-input:focus { border-color: #a78bfa; box-shadow: none; }
.dose-input::placeholder { color: rgba(167, 139, 250, 0.28); }
.unit-badge {
  font-size: 0.72rem; font-weight: 600; color: rgba(196, 181, 253, 0.6); font-family: var(--font-mono);
  background: rgba(167, 139, 250, 0.1); border: 1px solid rgba(167, 139, 250, 0.18);
  padding: 0.3rem 0.5rem; border-radius: 5px; white-space: nowrap; max-width: 120px; overflow: hidden; text-overflow: ellipsis;
}
.seg-ctrl {
  display: flex; background: rgba(255,255,255,0.025); border: 1px solid rgba(167, 139, 250, 0.15);
  border-radius: 7px; padding: 3px; gap: 3px;
}
.seg-btn {
  flex: 1; background: transparent; border: none; color: rgba(196, 181, 253, 0.5);
  padding: 0.4rem 0.3rem; border-radius: 5px; cursor: pointer; font-size: 0.82rem; font-weight: 600;
  font-family: var(--font-display); letter-spacing: 0.04em; transition: all 0.13s; white-space: nowrap;
}
.seg-btn:hover { color: #c4b5fd; background: rgba(167, 139, 250, 0.08); }
.seg-btn.is-active { background: rgba(167, 139, 250, 0.22); color: #ddd6fe; box-shadow: 0 0 6px rgba(167, 139, 250, 0.18); }
.toggle-btn {
  display: flex; align-items: center; gap: 0.55rem; background: rgba(255,255,255,0.025);
  border: 1px solid rgba(167, 139, 250, 0.15); color: rgba(196, 181, 253, 0.6);
  padding: 0.5rem 0.7rem; border-radius: 7px; cursor: pointer; font-size: 0.82rem; font-weight: 500;
  font-family: var(--font-family); width: 100%; margin-top: 0.75rem; transition: all 0.14s; text-align: left;
}
.toggle-btn.is-on { background: rgba(167, 139, 250, 0.14); border-color: rgba(167, 139, 250, 0.38); color: #c4b5fd; }
.toggle-pill {
  width: 32px; height: 18px; background: rgba(167, 139, 250, 0.18); border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 999px; position: relative; flex-shrink: 0; transition: background 0.2s;
}
.toggle-btn.is-on .toggle-pill { background: rgba(167, 139, 250, 0.32); }
.toggle-dot {
  position: absolute; width: 12px; height: 12px; background: rgba(167, 139, 250, 0.5);
  border-radius: 50%; top: 2px; left: 2px; transition: transform 0.2s, background 0.2s;
}
.toggle-dot.is-on { transform: translateX(13px); background: #a78bfa; }

/* ── Resultado ── */
.calc-output { min-height: 0; display: flex; }
.result-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.04), transparent 50%), var(--color-card-bg);
  border: 1px solid rgba(245, 158, 11, 0.22); border-radius: var(--radius-card);
  box-shadow: var(--shadow-card); transition: border-color 0.35s ease, box-shadow 0.35s ease; overflow: hidden;
}
.result-card.is-valid {
  border-color: rgba(45, 156, 219, 0.5);
  box-shadow: 0 0 40px rgba(45, 156, 219, 0.12), var(--shadow-card);
}
.result-head {
  display: flex; align-items: center; gap: 0.55rem; padding: 0.7rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(245, 158, 11, 0.09); color: #fcd34d;
  font-family: var(--font-display); font-weight: 700; font-size: 0.82rem; letter-spacing: 0.1em; text-transform: uppercase;
  transition: background 0.35s ease, color 0.35s ease;
}
.result-head.is-valid { background: rgba(45, 156, 219, 0.1); color: #7dd3f0; }
.ready-dot {
  width: 7px; height: 7px; background: #34d399; border-radius: 50%; margin-left: auto;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.8); animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.pending {
  flex: 1;
  padding: 2rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  text-align: center; justify-content: center; color: rgba(120, 170, 210, 0.4);
}
.pending-msg { font-size: 0.85rem; color: rgba(150, 190, 220, 0.55); margin: 0; max-width: 240px; }
.result-body { flex: 1; padding: 1rem; display: flex; flex-direction: column; gap: 0.85rem; }
.rate { display: flex; align-items: baseline; gap: 0.55rem; padding: 0.25rem 0 0.1rem; }
.rate-value {
  font-family: var(--font-mono); font-size: 3.6rem; font-weight: 700; color: #2d9cdb; line-height: 1;
  text-shadow: 0 0 40px rgba(45, 156, 219, 0.45), 0 0 12px rgba(45, 156, 219, 0.25); letter-spacing: -0.02em;
}
.rate-unit {
  font-family: var(--font-display); font-size: 1rem; font-weight: 600; color: rgba(125, 211, 240, 0.65);
  text-transform: uppercase; letter-spacing: 0.07em; line-height: 1;
}
.metrics {
  background: rgba(255,255,255,0.025); border: 1px solid rgba(45, 156, 219, 0.1);
  border-radius: 8px; padding: 0.6rem 0.7rem; display: flex; flex-direction: column; gap: 0.35rem;
}
.metric { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
.m-key { font-size: 0.69rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(100, 160, 195, 0.5); flex-shrink: 0; padding-top: 0.05rem; }
.m-val { font-family: var(--font-mono); font-size: 0.82rem; color: rgba(175, 215, 240, 0.9); text-align: right; }
.m-val--prep { font-family: var(--font-family); font-size: 0.78rem; color: rgba(150, 195, 225, 0.65); }
.warnings { display: flex; flex-direction: column; gap: 0.3rem; }
.warn {
  display: flex; align-items: flex-start; gap: 0.4rem; font-size: 0.77rem; color: #fbbf24;
  background: rgba(251, 191, 36, 0.07); border: 1px solid rgba(251, 191, 36, 0.18);
  border-radius: 6px; padding: 0.35rem 0.5rem; line-height: 1.4;
}

/* ── Modal ── */
.dosis-modal { max-width: min(94vw, 620px); }
.dosis-list { display: flex; flex-direction: column; gap: 0.6rem; }
.dosis-item {
  background: rgba(255,255,255,0.025); border: 1px solid rgba(129, 140, 248, 0.14);
  border-radius: 8px; padding: 0.65rem 0.8rem; display: flex; flex-direction: column; gap: 0.35rem;
}
.dosis-badge {
  font-size: 0.64rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  border-radius: 4px; padding: 0.1rem 0.4rem; align-self: flex-start; font-family: var(--font-display);
}
.badge-bolo  { background: rgba(251, 146, 60, 0.15); color: rgba(251, 146, 60, 0.9); }
.badge-perf  { background: rgba(129, 140, 248, 0.18); color: #a5b4fc; }
.badge-otros { background: rgba(148, 163, 184, 0.14); color: rgba(148, 163, 184, 0.75); }
.dosis-desc { font-size: 0.84rem; color: rgba(200, 215, 240, 0.78); line-height: 1.55; margin: 0; }
.dosis-desc--empty { color: rgba(200, 215, 240, 0.4); font-style: italic; }
.dosis-item--ped { background: rgba(244, 114, 182, 0.06); border-color: rgba(244, 114, 182, 0.25); }
.dosis-badge--ped { background: rgba(244, 114, 182, 0.16); color: #f9a8d4; }
.dosis-foot { margin-top: 1.25rem; display: flex; justify-content: flex-end; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.12s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Responsive ── */
/* Below the desktop band, single-screen no-scroll is unrealistic:
   fall back to natural document flow so content stacks and scrolls. */
@media (max-width: 980px) {
  .calc-screen {
    display: flex;
    flex-direction: column;
    height: auto;
    min-height: calc(100dvh - var(--nav-height, 60px));
    overflow: visible;
  }
  .calc-layout { grid-template-columns: 1fr; height: auto; }
  .calc-inputs { grid-template-columns: 1fr; }
  .input-col { overflow: visible; }
}
@media (max-width: 560px) {
  .farmaco-cols { grid-template-columns: 1fr; }
  .pauta-grid { grid-template-columns: 1fr; }
  .rate-value { font-size: 3rem; }
}
</style>
