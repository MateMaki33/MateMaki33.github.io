<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { useCalculadoraStore, VOLUMENES_SUERO } from '../../../stores/calculadora'

const store = useCalculadoraStore()
</script>

<template>
  <div class="node">
    <div class="node-header node-header--suero">
      <svg class="hdr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      <span>Suero / Diluyente</span>
    </div>

    <div class="node-body">
      <p class="field-label">Volumen de bolsa</p>
      <div class="vol-grid">
        <button
          v-for="v in VOLUMENES_SUERO"
          :key="v"
          class="vol-btn"
          :class="{ 'vol-btn--active': store.sueroVolumen === v }"
          @click="store.sueroVolumen = (v as any)"
        >
          {{ v }}<small> ml</small>
        </button>
      </div>

      <div class="summary-chip">
        <span>{{ store.sueroVolumen }} ml</span>
      </div>
    </div>

    <Handle id="suero-out" type="source" :position="Position.Right" class="node-handle" />
  </div>
</template>

<style scoped>
.node {
  min-width: 272px;
  background: #071220;
  border: 1px solid rgba(45, 156, 219, 0.28);
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
  font-family: var(--font-display, 'Barlow Condensed', sans-serif);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.node-header--suero {
  background: rgba(45, 156, 219, 0.1);
  color: #7dd3f0;
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
  color: rgba(125, 180, 210, 0.5);
  margin: 0;
}
.top-gap { margin-top: 0.7rem; }

.vol-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.28rem;
}

.vol-btn {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(45, 156, 219, 0.17);
  color: rgba(150, 210, 235, 0.7);
  padding: 0.45rem 0.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 700;
  font-family: var(--font-display, 'Barlow Condensed', sans-serif);
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  transition: all 0.14s ease;
  line-height: 1;
}
.vol-btn small { font-size: 0.62rem; font-weight: 400; opacity: 0.65; }
.vol-btn:hover {
  background: rgba(45, 156, 219, 0.1);
  border-color: rgba(45, 156, 219, 0.4);
  color: #7dd3f0;
}
.vol-btn--active {
  background: rgba(45, 156, 219, 0.2);
  border-color: #2d9cdb;
  color: #bae6fd;
  box-shadow: 0 0 8px rgba(45, 156, 219, 0.22);
}


.summary-chip {
  margin-top: 0.15rem;
  font-size: 0.75rem;
  color: rgba(125, 190, 220, 0.5);
  background: rgba(45, 156, 219, 0.06);
  border: 1px solid rgba(45, 156, 219, 0.12);
  border-radius: 5px;
  padding: 0.3rem 0.55rem;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}

:deep(.node-handle) {
  width: 10px !important;
  height: 10px !important;
  border: 2px solid rgba(45, 156, 219, 0.7) !important;
  background: #07121f !important;
}
</style>
