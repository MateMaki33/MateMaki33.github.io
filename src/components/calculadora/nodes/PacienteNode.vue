<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { useCalculadoraStore } from '../../../stores/calculadora'

const store = useCalculadoraStore()

const PRESETS = [40, 50, 60, 70, 80, 90, 100, 110]

function step(delta: number) {
  store.pacientePeso = Math.max(1, Math.min(300, (store.pacientePeso ?? 70) + delta))
}
</script>

<template>
  <div class="node">
    <div class="node-header">
      <svg class="hdr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="7" r="4"/><path d="M5.2 22a8 8 0 0 1 13.6 0"/>
      </svg>
      <span>Paciente</span>
    </div>

    <div class="node-body">
      <p class="field-label">Peso corporal</p>
      <div class="weight-row">
        <button class="step-btn" @click="step(-5)" title="-5 kg">−5</button>
        <button class="step-btn" @click="step(-1)">−</button>
        <input
          v-model.number="store.pacientePeso"
          type="number"
          min="1"
          max="300"
          class="weight-input"
          aria-label="Peso en kg"
        />
        <button class="step-btn" @click="step(1)">+</button>
        <button class="step-btn" @click="step(5)" title="+5 kg">+5</button>
      </div>
      <span class="kg-badge">kg</span>

      <p class="field-label top-gap">Presets rápidos (kg)</p>
      <div class="preset-grid">
        <button
          v-for="kg in PRESETS"
          :key="kg"
          class="preset-btn"
          :class="{ 'preset-btn--active': store.pacientePeso === kg }"
          @click="store.pacientePeso = kg"
        >{{ kg }}</button>
      </div>
    </div>

    <Handle id="paciente-out" type="source" :position="Position.Right" class="node-handle" />
  </div>
</template>

<style scoped>
.node {
  min-width: 256px;
  background: #071220;
  border: 1px solid rgba(52, 211, 153, 0.25);
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
  background: rgba(52, 211, 153, 0.09);
  color: #6ee7b7;
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
  color: rgba(110, 210, 170, 0.48);
  margin: 0;
}
.top-gap { margin-top: 0.7rem; }

.weight-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.step-btn {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.22);
  color: #6ee7b7;
  min-width: 32px;
  height: 40px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
  font-family: var(--font-display, 'Barlow Condensed', sans-serif);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.13s;
  flex-shrink: 0;
  padding: 0 0.4rem;
}
.step-btn:hover { background: rgba(52, 211, 153, 0.2); border-color: #34d399; }

.weight-input {
  flex: 1;
  text-align: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(52, 211, 153, 0.22);
  color: #6ee7b7;
  padding: 0.4rem 0.3rem;
  border-radius: 7px;
  font-size: 1.6rem;
  font-weight: 700;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  outline: none;
  transition: border-color 0.14s;
  min-width: 0;
}
.weight-input:focus { border-color: #34d399; }

.kg-badge {
  text-align: right;
  font-size: 0.72rem;
  color: rgba(110, 231, 183, 0.4);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.28rem;
}
.preset-btn {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(52, 211, 153, 0.14);
  color: rgba(110, 231, 183, 0.6);
  padding: 0.38rem 0.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.86rem;
  font-weight: 600;
  font-family: var(--font-display, 'Barlow Condensed', sans-serif);
  transition: all 0.13s;
}
.preset-btn:hover { background: rgba(52, 211, 153, 0.1); border-color: rgba(52, 211, 153, 0.35); color: #6ee7b7; }
.preset-btn--active { background: rgba(52, 211, 153, 0.18); border-color: #34d399; color: #a7f3d0; }

:deep(.node-handle) {
  width: 10px !important;
  height: 10px !important;
  border: 2px solid rgba(52, 211, 153, 0.65) !important;
  background: #07121f !important;
}
</style>
