<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useCalculadoraStore } from '../../../stores/calculadora'
import type { Farmaco } from '../../../stores/calculadora'
import medicamentos from '../../../collections/medicamentos_normalizados.json'
import { parseQuantityToMg, formatMg } from '../../../utils/unitConverter'

const store = useCalculadoraStore()
const allFarmacos = medicamentos as unknown as Farmaco[]

const searchTerm = ref('')
const showDropdown = ref(false)

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

const mgPorUnidad = computed(() => {
  if (!store.farmacoPresentacion?.cantidad) return null
  return parseQuantityToMg(store.farmacoPresentacion.cantidad)
})

const mgPorUnidadLabel = computed(() => {
  if (mgPorUnidad.value === null) return null
  return formatMg(mgPorUnidad.value)
})

const totalLabel = computed(() =>
  store.farmacoTotalMg > 0 ? formatMg(store.farmacoTotalMg) : null
)
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
            :key="p.cantidad + p.forma"
            :value="p"
          >{{ p.forma }} · {{ p.cantidad }}<template v-if="p.volumen"> / {{ p.volumen }}</template></option>
        </select>

        <!-- Presentation info chip -->
        <div v-if="store.farmacoPresentacion" class="pres-chip">
          <span class="pres-qty">{{ store.farmacoPresentacion.cantidad }}</span>
          <span v-if="store.farmacoPresentacion.volumen" class="pres-vol">en {{ store.farmacoPresentacion.volumen }}</span>
          <span v-if="mgPorUnidadLabel" class="pres-mg-tag">{{ mgPorUnidadLabel }}/ud</span>
          <span v-else class="pres-warn-tag">mg no detectados</span>
        </div>

        <!-- Units -->
        <p class="field-label top-gap">Unidades / ampollas a añadir</p>
        <div class="stepper">
          <button class="step-btn" @click="store.farmacoCantidad = Math.max(0.5, store.farmacoCantidad - 1)">−</button>
          <input
            v-model.number="store.farmacoCantidad"
            type="number"
            min="0.5"
            step="0.5"
            class="step-val"
            aria-label="Cantidad de unidades"
          />
          <button class="step-btn" @click="store.farmacoCantidad = store.farmacoCantidad + 1">+</button>
        </div>

        <!-- Manual mg input when parsing fails -->
        <div v-if="mgPorUnidad === null" class="manual-block">
          <p class="field-label" style="color:rgba(251,146,60,0.6)">⚠ Introduce mg totales manualmente</p>
          <input
            v-model.number="store.farmacoMgManual"
            type="number"
            min="0"
            step="0.1"
            class="field-input"
            placeholder="mg en bolsa"
          />
        </div>

        <!-- Total -->
        <div v-if="totalLabel" class="total-row">
          <span class="total-label">Total en bolsa</span>
          <strong class="total-value">{{ totalLabel }}</strong>
        </div>
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
  color: rgba(185, 195, 255, 0.9);
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
.pres-warn-tag {
  margin-left: auto;
  background: rgba(251, 146, 60, 0.12);
  color: rgba(251, 146, 60, 0.7);
  padding: 0.08rem 0.38rem;
  border-radius: 4px;
  font-size: 0.7rem;
}

/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.step-btn {
  width: 34px;
  height: 34px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: #a5b4fc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.13s;
  flex-shrink: 0;
}
.step-btn:hover { background: rgba(99, 102, 241, 0.22); border-color: #6366f1; }

.step-val {
  flex: 1;
  text-align: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99, 102, 241, 0.22);
  color: rgba(200, 210, 255, 0.95);
  padding: 0.35rem 0.3rem;
  border-radius: 6px;
  font-size: 1.05rem;
  font-weight: 700;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  outline: none;
  min-width: 0;
}
.step-val:focus { border-color: #6366f1; }

/* Manual block */
.manual-block {
  background: rgba(251, 146, 60, 0.07);
  border: 1px solid rgba(251, 146, 60, 0.18);
  border-radius: 6px;
  padding: 0.5rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.2rem;
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

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.12s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

:deep(.node-handle) {
  width: 10px !important;
  height: 10px !important;
  border: 2px solid rgba(99, 102, 241, 0.65) !important;
  background: #07121f !important;
}
</style>
