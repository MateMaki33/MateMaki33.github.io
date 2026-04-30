<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useCalculadoraStore } from '../../../stores/calculadora'
import { formatMg } from '../../../utils/unitConverter'

const store = useCalculadoraStore()
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
  if (res.value.mlForBolus !== null) return 'ml  (bolo)'
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
  if (!mg) return null
  return formatMg(mg) + '/h'
})

const preparacionLabel = computed(() => {
  if (store.farmacoTotalMg <= 0) return null
  return `${formatMg(store.farmacoTotalMg)} en ${store.sueroVolumen} ml`
})
</script>

<template>
  <div class="node" :class="{ 'node--valid': res.isValid }">
    <!-- 4 target handles posicionados verticalmente -->
    <Handle id="resultado-suero"    type="target" :position="Position.Left" style="top:16%" class="t-handle t-handle--cyan" />
    <Handle id="resultado-farmaco"  type="target" :position="Position.Left" style="top:38%" class="t-handle t-handle--indigo" />
    <Handle id="resultado-paciente" type="target" :position="Position.Left" style="top:60%" class="t-handle t-handle--green" />
    <Handle id="resultado-dosis"    type="target" :position="Position.Left" style="top:82%" class="t-handle t-handle--violet" />

    <div class="node-header" :class="{ 'node-header--valid': res.isValid }">
      <svg class="hdr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <span>Ritmo de Infusión</span>
      <span v-if="res.isValid" class="ready-dot"></span>
    </div>

    <!-- Error / Pending state -->
    <div v-if="res.error" class="pending-state">
      <div class="pending-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <p class="pending-msg">{{ res.error }}</p>
    </div>

    <!-- Result -->
    <div v-else class="result-body">
      <!-- Primary: big rate -->
      <div class="rate-display">
        <div class="rate-value">{{ rateLabel }}</div>
        <div class="rate-unit">{{ rateUnit }}</div>
      </div>

      <!-- Metrics grid -->
      <div class="metrics-box">
        <div v-if="concLabel" class="metric-row">
          <span class="metric-key">Concentración</span>
          <span class="metric-val">{{ concLabel }}</span>
        </div>
        <div v-if="mgHLabel" class="metric-row">
          <span class="metric-key">Dosis/hora</span>
          <span class="metric-val">{{ mgHLabel }}</span>
        </div>
        <div v-if="res.gtasPerMin !== null" class="metric-row">
          <span class="metric-key">Macrogotero</span>
          <span class="metric-val">{{ res.gtasPerMin.toFixed(1) }} gtas/min</span>
        </div>
        <div v-if="preparacionLabel" class="metric-row metric-row--prep">
          <span class="metric-key">Preparación</span>
          <span class="metric-val metric-val--prep">{{ preparacionLabel }}</span>
        </div>
      </div>

      <!-- Warnings -->
      <div v-if="res.warnings.length" class="warnings">
        <div v-for="w in res.warnings" :key="w" class="warn-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" style="flex-shrink:0">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {{ w }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.node {
  min-width: 308px;
  background: #071220;
  border: 1px solid rgba(245, 158, 11, 0.22);
  border-radius: 10px;
  font-family: var(--font-family, 'Barlow', sans-serif);
  box-shadow: 0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
  transition: border-color 0.35s ease, box-shadow 0.35s ease;
}
.node--valid {
  border-color: rgba(45, 156, 219, 0.5);
  box-shadow: 0 0 40px rgba(45, 156, 219, 0.12), 0 6px 28px rgba(0,0,0,0.55);
}

/* Header */
.node-header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 1rem;
  border-radius: 9px 9px 0 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(245, 158, 11, 0.09);
  color: #fcd34d;
  font-family: var(--font-display, 'Barlow Condensed', sans-serif);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: background 0.35s ease, color 0.35s ease;
}
.node-header--valid {
  background: rgba(45, 156, 219, 0.1);
  color: #7dd3f0;
}
.hdr-icon { width: 15px; height: 15px; flex-shrink: 0; }

.ready-dot {
  width: 7px;
  height: 7px;
  background: #34d399;
  border-radius: 50%;
  margin-left: auto;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.8);
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Pending */
.pending-state {
  padding: 1.75rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  min-height: 140px;
  justify-content: center;
}
.pending-icon { color: rgba(120, 170, 210, 0.35); }
.pending-msg {
  font-size: 0.83rem;
  color: rgba(150, 190, 220, 0.55);
  margin: 0;
  max-width: 240px;
}

/* Result body */
.result-body {
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

/* Rate */
.rate-display {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  padding: 0.35rem 0 0.1rem;
}
.rate-value {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 3.8rem;
  font-weight: 700;
  color: #2d9cdb;
  line-height: 1;
  text-shadow: 0 0 40px rgba(45, 156, 219, 0.45), 0 0 12px rgba(45, 156, 219, 0.25);
  letter-spacing: -0.02em;
}
.rate-unit {
  font-family: var(--font-display, 'Barlow Condensed', sans-serif);
  font-size: 1rem;
  font-weight: 600;
  color: rgba(125, 211, 240, 0.65);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  line-height: 1;
}

/* Metrics */
.metrics-box {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(45, 156, 219, 0.1);
  border-radius: 8px;
  padding: 0.5rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
}
.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}
.metric-key {
  font-size: 0.69rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(100, 160, 195, 0.45);
  flex-shrink: 0;
  padding-top: 0.05rem;
}
.metric-val {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.8rem;
  color: rgba(175, 215, 240, 0.88);
  text-align: right;
}
.metric-row--prep { align-items: flex-start; }
.metric-val--prep {
  font-family: var(--font-family, 'Barlow', sans-serif);
  font-size: 0.77rem;
  color: rgba(150, 195, 225, 0.65);
}

/* Warnings */
.warnings { display: flex; flex-direction: column; gap: 0.28rem; }
.warn-row {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.76rem;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.07);
  border: 1px solid rgba(251, 191, 36, 0.18);
  border-radius: 6px;
  padding: 0.32rem 0.5rem;
  line-height: 1.4;
}

/* Target handles with color per stream */
:deep(.t-handle) {
  width: 9px !important;
  height: 9px !important;
  border-radius: 50% !important;
}
:deep(.t-handle--cyan)   { border: 2px solid rgba(45, 156, 219, 0.7) !important; background: #07121f !important; }
:deep(.t-handle--indigo) { border: 2px solid rgba(99, 102, 241, 0.7) !important; background: #07121f !important; }
:deep(.t-handle--green)  { border: 2px solid rgba(52, 211, 153, 0.7) !important; background: #07121f !important; }
:deep(.t-handle--violet) { border: 2px solid rgba(167, 139, 250, 0.7) !important; background: #07121f !important; }
</style>
