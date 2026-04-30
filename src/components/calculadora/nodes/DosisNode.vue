<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { useCalculadoraStore } from '../../../stores/calculadora'
import type { MassUnit, TimeUnit } from '../../../utils/unitConverter'

const store = useCalculadoraStore()

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
</script>

<template>
  <div class="node">
    <div class="node-header">
      <svg class="hdr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>Pauta / Dosis</span>
    </div>

    <div class="node-body">
      <!-- Valor numérico -->
      <p class="field-label">Dosis deseada</p>
      <div class="dose-row">
        <input
          v-model.number="store.dosisValor"
          type="number"
          min="0"
          step="0.1"
          class="dose-input"
          placeholder="0.0"
        />
        <span class="unit-badge">{{ store.dosisUnidadLabel }}</span>
      </div>

      <!-- Unidad de masa -->
      <p class="field-label top-gap">Unidad de masa</p>
      <div class="seg-ctrl">
        <button
          v-for="u in massUnits"
          :key="u.value"
          class="seg-btn"
          :class="{ 'seg-btn--active': store.dosisMasaUnidad === u.value }"
          @click="store.dosisMasaUnidad = u.value"
        >{{ u.label }}</button>
      </div>

      <!-- Per kg toggle -->
      <button
        class="toggle-btn"
        :class="{ 'toggle-btn--on': store.dosisPorKg }"
        @click="store.dosisPorKg = !store.dosisPorKg"
      >
        <span class="toggle-pill">
          <span class="toggle-dot" :class="{ 'toggle-dot--on': store.dosisPorKg }"></span>
        </span>
        Dosis ponderada por kg
      </button>

      <!-- Modalidad temporal -->
      <p class="field-label top-gap">Modalidad</p>
      <div class="seg-ctrl">
        <button
          v-for="t in timeUnits"
          :key="t.value"
          class="seg-btn"
          :class="{ 'seg-btn--active': store.dosisTiempoUnidad === t.value }"
          @click="store.dosisTiempoUnidad = t.value"
        >{{ t.label }}</button>
      </div>
    </div>

    <Handle id="dosis-out" type="source" :position="Position.Right" class="node-handle" />
  </div>
</template>

<style scoped>
.node {
  min-width: 268px;
  background: #071220;
  border: 1px solid rgba(167, 139, 250, 0.25);
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
  background: rgba(167, 139, 250, 0.09);
  color: #c4b5fd;
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
  color: rgba(167, 139, 250, 0.45);
  margin: 0;
}
.top-gap { margin-top: 0.7rem; }

/* Dose input */
.dose-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dose-input {
  flex: 1;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(167, 139, 250, 0.28);
  color: #c4b5fd;
  padding: 0.45rem 0.55rem;
  border-radius: 7px;
  font-size: 1.25rem;
  font-weight: 700;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  outline: none;
  min-width: 0;
  transition: border-color 0.14s;
}
.dose-input:focus { border-color: #a78bfa; }
.dose-input::placeholder { color: rgba(167, 139, 250, 0.28); }

.unit-badge {
  font-size: 0.73rem;
  font-weight: 600;
  color: rgba(196, 181, 253, 0.55);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.18);
  padding: 0.25rem 0.45rem;
  border-radius: 5px;
  white-space: nowrap;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Segmented control */
.seg-ctrl {
  display: flex;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(167, 139, 250, 0.15);
  border-radius: 7px;
  padding: 3px;
  gap: 3px;
}

.seg-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: rgba(196, 181, 253, 0.48);
  padding: 0.32rem 0.3rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font-display, 'Barlow Condensed', sans-serif);
  letter-spacing: 0.04em;
  transition: all 0.13s;
  white-space: nowrap;
}
.seg-btn:hover { color: #c4b5fd; background: rgba(167, 139, 250, 0.08); }
.seg-btn--active {
  background: rgba(167, 139, 250, 0.22);
  color: #ddd6fe;
  box-shadow: 0 0 6px rgba(167, 139, 250, 0.18);
}

/* Toggle */
.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(167, 139, 250, 0.15);
  color: rgba(196, 181, 253, 0.55);
  padding: 0.4rem 0.65rem;
  border-radius: 7px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: var(--font-family, 'Barlow', sans-serif);
  width: 100%;
  margin-top: 0.35rem;
  transition: all 0.14s;
  text-align: left;
}
.toggle-btn--on {
  background: rgba(167, 139, 250, 0.14);
  border-color: rgba(167, 139, 250, 0.38);
  color: #c4b5fd;
}

.toggle-pill {
  width: 30px;
  height: 17px;
  background: rgba(167, 139, 250, 0.18);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 999px;
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s;
}
.toggle-btn--on .toggle-pill { background: rgba(167, 139, 250, 0.32); }

.toggle-dot {
  position: absolute;
  width: 11px;
  height: 11px;
  background: rgba(167, 139, 250, 0.5);
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.2s, background 0.2s;
}
.toggle-dot--on { transform: translateX(13px); background: #a78bfa; }

:deep(.node-handle) {
  width: 10px !important;
  height: 10px !important;
  border: 2px solid rgba(167, 139, 250, 0.65) !important;
  background: #07121f !important;
}
</style>
