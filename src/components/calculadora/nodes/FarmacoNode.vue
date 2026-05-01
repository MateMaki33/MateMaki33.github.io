<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed, ref } from 'vue'
import { FARMACOS } from '../../../data/farmacos'
import type { Farmaco } from '../../../stores/calculadora'
import { useCalculadoraStore } from '../../../stores/calculadora'
import { formatMg } from '../../../utils/unitConverter'

const store = useCalculadoraStore()
const allFarmacos = Object.values(FARMACOS) as Farmaco[]

const searchTerm = ref('')
const showDropdown = ref(false)
const showDosis = ref(false)

const filteredFarmacos = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (term.length < 2) return []
  const starts   = allFarmacos.filter(f => f.nombre.toLowerCase().startsWith(term))
  const contains = allFarmacos.filter(f => !f.nombre.toLowerCase().startsWith(term) && f.nombre.toLowerCase().includes(term))
  return [...starts, ...contains].slice(0, 10)
})

function selectFarmaco(f: Farmaco) {
  store.seleccionarFarmaco(f)
  searchTerm.value = f.nombre
  showDropdown.value = false
  showDosis.value = false
}

function onInput() {
  showDropdown.value = true
  if (!searchTerm.value.trim()) {
    store.farmacoSeleccionado = null
    store.farmacoPresentacion = null
  }
}

function onBlur() {
  setTimeout(() => { showDropdown.value = false }, 200)
}

const mgPorUnidadLabel = computed(() =>
  store.farmacoMgPorUnidad !== null ? formatMg(store.farmacoMgPorUnidad) : null
)

const totalLabel = computed(() =>
  store.farmacoTotalMg > 0 ? formatMg(store.farmacoTotalMg) : null
)

const tipoBadgeClass = (tipo: string) => {
  if (tipo === 'bolo') return 'badge-bolo'
  if (tipo === 'perfusion') return 'badge-perf'
  return 'badge-otros'
}
</script>

<template>
  <div class="node">
    <div class="node-header">
      <svg class="hdr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/><circle cx="18" cy="18" r="3"/><path d="m22 22-1.5-1.5"/>
      </svg>
      <span>Fármaco</span>
    </div>

    <div class="node-body">
      <!-- Search -->
      <p class="field-label">Buscar fármaco</p>
      <div class="search-wrap">
        <input
          v-model="searchTerm"
          type="text"
          class="field-input"
          placeholder="Escribe el nombre..."
          autocomplete="off"
          spellcheck="false"
          @input="onInput"
          @focus="showDropdown = true"
          @blur="onBlur"
        />
        <transition name="fade">
          <ul v-if="showDropdown && filteredFarmacos.length" class="drug-dropdown" role="listbox">
            <li
              v-for="f in filteredFarmacos"
              :key="f.nombre"
              class="drug-item"
              role="option"
              @mousedown.prevent="selectFarmaco(f)"
            >{{ f.nombre }}</li>
          </ul>
        </transition>
      </div>

      <!-- Drug selected -->
      <template v-if="store.farmacoSeleccionado">
        <p class="field-label top-gap">Presentación</p>
        <select v-model="store.farmacoPresentacion" class="field-select">
          <option
            v-for="p in store.farmacoSeleccionado.presentaciones"
            :key="`${p.cantidad.valor}${p.cantidad.unidad}${p.forma}`"
            :value="p"
          >{{ p.forma }} · {{ p.cantidad.valor }} {{ p.cantidad.unidad }}<template v-if="p.volumen"> / {{ p.volumen.valor }} {{ p.volumen.unidad }}</template></option>
        </select>

        <!-- Presentation info chip -->
        <div v-if="store.farmacoPresentacion" class="pres-chip">
          <span class="pres-qty">{{ store.farmacoPresentacion.cantidad.valor }} {{ store.farmacoPresentacion.cantidad.unidad }}</span>
          <span v-if="store.farmacoPresentacion.volumen" class="pres-vol">en {{ store.farmacoPresentacion.volumen.valor }} {{ store.farmacoPresentacion.volumen.unidad }}</span>
          <span v-if="mgPorUnidadLabel" class="pres-mg-tag">{{ mgPorUnidadLabel }}/ud</span>
        </div>

        <!-- Mass input -->
        <p class="field-label top-gap">Cantidad de fármaco a añadir</p>
        <div class="mass-row">
          <input
            v-model.number="store.farmacoMasaValor"
            type="number"
            min="0"
            step="any"
            class="mass-val"
            placeholder="0"
            aria-label="Cantidad de fármaco"
            @mousedown.stop
            @wheel.stop
          />
          <div class="unit-btns">
            <button
              v-for="u in (['mcg', 'mg', 'g', 'UI'] as const)"
              :key="u"
              :class="['unit-btn', store.farmacoMasaUnidad === u && 'active']"
              @click="store.farmacoMasaUnidad = u"
            >{{ u }}</button>
          </div>
        </div>

        <!-- Equivalent vials hint -->
        <p v-if="store.farmacoEquivalenteUnidades !== null" class="equiv-hint">
          ≈ {{ store.farmacoEquivalenteUnidades }} ud. de la presentación seleccionada
        </p>

        <!-- Total -->
        <div v-if="totalLabel" class="total-row">
          <span class="total-label">Total en bolsa</span>
          <strong class="total-value">{{ totalLabel }}</strong>
        </div>

        <!-- Dosis reference -->
        <template v-if="store.farmacoSeleccionado.dosis?.length">
          <button class="dosis-toggle" @click="showDosis = !showDosis">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" class="toggle-icon" :class="{ rotated: showDosis }">
              <path d="M3 6l5 5 5-5"/>
            </svg>
            Dosis de referencia
          </button>
          <transition name="slide">
            <div v-if="showDosis" class="dosis-list">
              <div
                v-for="d in store.farmacoSeleccionado.dosis"
                :key="d.tipo + d.descripcion"
                class="dosis-item"
              >
                <span :class="['dosis-badge', tipoBadgeClass(d.tipo)]">{{ d.tipo }}</span>
                <p class="dosis-desc">{{ d.descripcion }}</p>
              </div>
            </div>
          </transition>
        </template>
      </template>
    </div>

    <Handle id="farmaco-out" type="source" :position="Position.Right" class="node-handle" />
  </div>
</template>

<style scoped>
.node {
  min-width: 288px;
  background: #071220;
  border: 1px solid rgba(99, 102, 241, 0.28);
  border-radius: 10px;
  font-family: var(--font-family, 'Barlow', sans-serif);
  box-shadow: 0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 1rem;
  border-radius: 9px 9px 0 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(99, 102, 241, 0.1);
  color: #a5b4fc;
  font-family: var(--font-display, 'Barlow Condensed', sans-serif);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.hdr-icon { width: 15px; height: 15px; flex-shrink: 0; }

.node-body {
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(165, 180, 252, 0.45);
  margin: 0;
}
.top-gap { margin-top: 0.7rem; }

/* Search */
.search-wrap { position: relative; z-index: 10; }

.field-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99, 102, 241, 0.28);
  color: rgba(200, 210, 255, 0.95);
  padding: 0.42rem 0.55rem;
  border-radius: 6px;
  font-size: 0.84rem;
  font-family: var(--font-family, 'Barlow', sans-serif);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.14s;
}
.field-input:focus { border-color: #6366f1; }
.field-input::placeholder { color: rgba(165, 180, 252, 0.3); }

.drug-dropdown {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  z-index: 1000;
  list-style: none;
  margin: 0;
  padding: 0;
  background: #0c1826;
  border: 1px solid rgba(99, 102, 241, 0.38);
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 10px 24px rgba(0,0,0,0.65);
}
.drug-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: rgba(190, 205, 255, 0.85);
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  transition: background 0.1s;
}
.drug-item:last-child { border-bottom: none; }
.drug-item:hover { background: rgba(99, 102, 241, 0.18); color: #a5b4fc; }

/* Select */
.field-select {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99, 102, 241, 0.22);
  color: #6366f1;
  padding: 0.42rem 0.55rem;
  border-radius: 6px;
  font-size: 0.81rem;
  font-family: var(--font-family, 'Barlow', sans-serif);
  cursor: pointer;
  outline: none;
  transition: border-color 0.14s;
}
.field-select:focus { border-color: #6366f1; }

/* Pres chip */
.pres-chip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: center;
  font-size: 0.76rem;
  background: rgba(99, 102, 241, 0.07);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 6px;
  padding: 0.32rem 0.55rem;
}
.pres-qty  { color: rgba(185, 195, 255, 0.75); font-weight: 600; }
.pres-vol  { color: rgba(165, 175, 240, 0.5); }
.pres-mg-tag {
  margin-left: auto;
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 0.08rem 0.38rem;
  border-radius: 4px;
  font-size: 0.73rem;
  font-weight: 700;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}

/* Mass input */
.mass-row {
  display: flex;
  align-items: stretch;
  gap: 0.35rem;
}

.mass-val {
  flex: 1;
  min-width: 0;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99, 102, 241, 0.28);
  color: rgba(200, 210, 255, 0.95);
  padding: 0.42rem 0.55rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  outline: none;
  transition: border-color 0.14s;
  text-align: right;
}
.mass-val:focus { border-color: #6366f1; }
.mass-val::placeholder { color: rgba(165, 180, 252, 0.2); font-weight: 400; }

.unit-btns {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

.unit-btn {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: rgba(165, 180, 252, 0.45);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.66rem;
  font-weight: 700;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  letter-spacing: 0.04em;
  padding: 0 0.5rem;
  flex: 1;
  transition: all 0.12s;
  white-space: nowrap;
}
.unit-btn:hover { background: rgba(99, 102, 241, 0.14); color: #a5b4fc; border-color: rgba(99,102,241,0.4); }
.unit-btn.active {
  background: rgba(99, 102, 241, 0.25);
  border-color: #6366f1;
  color: #c7d2fe;
}

/* Equivalent hint */
.equiv-hint {
  font-size: 0.68rem;
  color: rgba(165, 180, 252, 0.38);
  margin: 0.1rem 0 0;
  font-style: italic;
}

/* Total */
.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.28);
  border-radius: 7px;
  padding: 0.45rem 0.7rem;
  margin-top: 0.2rem;
}
.total-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(165, 180, 252, 0.6);
}
.total-value {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.95rem;
  font-weight: 700;
  color: #a5b4fc;
}

/* Dosis toggle */
.dosis-toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.55rem;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(165, 180, 252, 0.45);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: var(--font-family, 'Barlow', sans-serif);
  padding: 0;
  transition: color 0.12s;
}
.dosis-toggle:hover { color: rgba(165, 180, 252, 0.75); }
.toggle-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  transition: transform 0.18s;
}
.toggle-icon.rotated { transform: rotate(180deg); }

/* Dosis list */
.dosis-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.25rem;
}

.dosis-item {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 6px;
  padding: 0.4rem 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
}

.dosis-badge {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 3px;
  padding: 0.05rem 0.32rem;
  align-self: flex-start;
}
.badge-bolo  { background: rgba(251, 146, 60, 0.15); color: rgba(251, 146, 60, 0.85); }
.badge-perf  { background: rgba(99, 102, 241, 0.18); color: #a5b4fc; }
.badge-otros { background: rgba(148, 163, 184, 0.12); color: rgba(148, 163, 184, 0.6); }

.dosis-desc {
  font-size: 0.73rem;
  color: rgba(185, 200, 255, 0.6);
  line-height: 1.45;
  margin: 0;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.12s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active { transition: opacity 0.15s, transform 0.15s; }
.slide-leave-active { transition: opacity 0.1s; }
.slide-enter-from  { opacity: 0; transform: translateY(-4px); }
.slide-leave-to    { opacity: 0; }

:deep(.node-handle) {
  width: 10px !important;
  height: 10px !important;
  border: 2px solid rgba(99, 102, 241, 0.65) !important;
  background: #07121f !important;
}
</style>
