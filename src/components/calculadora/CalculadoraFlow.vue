<script setup lang="ts">
import { VueFlow, type NodeTypesObject } from '@vue-flow/core'
import { computed, markRaw, ref } from 'vue'
import { useCalculadoraStore } from '../../stores/calculadora'
import DosisNode from './nodes/DosisNode.vue'
import FarmacoNode from './nodes/FarmacoNode.vue'
import PacienteNode from './nodes/PacienteNode.vue'
import ResultadoNode from './nodes/ResultadoNode.vue'
import SueroNode from './nodes/SueroNode.vue'

// Estilos base de Vue Flow (posicionamiento de nodos y handles)
import '@vue-flow/core/dist/style.css'

const store = useCalculadoraStore()

const nodeTypes = {
  suero:     markRaw(SueroNode),
  farmaco:   markRaw(FarmacoNode),
  paciente:  markRaw(PacienteNode),
  dosis:     markRaw(DosisNode),
  resultado: markRaw(ResultadoNode),
} as NodeTypesObject

// Layout: 3 columnas — Preparación | Sujeto+Pauta | Resultado
const nodes = ref([
  { id: 'suero',     type: 'suero',     position: { x: 20,  y: 20  }, data: {} },
  { id: 'farmaco',   type: 'farmaco',   position: { x: 20,  y: 240 }, data: {} },
  { id: 'paciente',  type: 'paciente',  position: { x: 390, y: 20  }, data: {} },
  { id: 'dosis',     type: 'dosis',     position: { x: 390, y: 205 }, data: {} },
  { id: 'resultado', type: 'resultado', position: { x: 750, y: 60  }, data: {} },
])

const LABEL_STYLE     = { fontSize: '10px', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }
const LABEL_BG_STYLE  = { fill: 'rgba(3,12,23,0.88)', rx: 4, ry: 4 }
const LABEL_BG_PAD    = [4, 6] as [number, number]

const edges = computed(() => [
  {
    id: 'e-suero', source: 'suero', target: 'resultado',
    sourceHandle: 'suero-out', targetHandle: 'resultado-suero',
    animated: true, type: 'smoothstep',
    style: { stroke: '#2d9cdb', strokeWidth: 2, opacity: 0.55 },
    label: `${store.sueroVolumen} ml`,
    labelStyle: { ...LABEL_STYLE, fill: '#7dd3f0' },
    labelBgStyle: LABEL_BG_STYLE,
    labelBgPadding: LABEL_BG_PAD,
  },
  {
    id: 'e-farmaco', source: 'farmaco', target: 'resultado',
    sourceHandle: 'farmaco-out', targetHandle: 'resultado-farmaco',
    animated: true, type: 'smoothstep',
    style: { stroke: '#818cf8', strokeWidth: 2, opacity: 0.55 },
    label: store.farmacoTotalLabel ?? '—',
    labelStyle: { ...LABEL_STYLE, fill: '#a5b4fc' },
    labelBgStyle: LABEL_BG_STYLE,
    labelBgPadding: LABEL_BG_PAD,
  },
  {
    id: 'e-paciente', source: 'paciente', target: 'resultado',
    sourceHandle: 'paciente-out', targetHandle: 'resultado-paciente',
    animated: true, type: 'smoothstep',
    style: { stroke: '#34d399', strokeWidth: 2, opacity: 0.55 },
    label: store.pacientePeso != null ? `${store.pacientePeso} kg` : '—',
    labelStyle: { ...LABEL_STYLE, fill: '#6ee7b7' },
    labelBgStyle: LABEL_BG_STYLE,
    labelBgPadding: LABEL_BG_PAD,
  },
  {
    id: 'e-dosis', source: 'dosis', target: 'resultado',
    sourceHandle: 'dosis-out', targetHandle: 'resultado-dosis',
    animated: true, type: 'smoothstep',
    style: { stroke: '#a78bfa', strokeWidth: 2, opacity: 0.55 },
    label: store.dosisValor != null ? `${store.dosisValor} ${store.dosisUnidadLabel}` : '—',
    labelStyle: { ...LABEL_STYLE, fill: '#c4b5fd' },
    labelBgStyle: LABEL_BG_STYLE,
    labelBgPadding: LABEL_BG_PAD,
  },
])
</script>

<template>
  <div class="calc-wrapper">
    <!-- Toolbar -->
    <div class="calc-toolbar">
      <div>
        <h1 class="toolbar-title">Calculadora de Perfusión versión Beta</h1>
        <p class="toolbar-sub"> Siempre revisar. Herramienta de apoyo · MadRescue112</p>
      </div>
      <button class="reset-btn" @click="store.reset()" aria-label="Reiniciar calculadora">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="13" height="13">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 .49-3.35"/>
        </svg>
        Reiniciar
      </button>
    </div>

    <!-- Legend -->
    <div class="legend">
      <span class="leg-item leg-item--cyan">Suero</span>
      <span class="leg-item leg-item--indigo">Fármaco</span>
      <span class="leg-item leg-item--green">Paciente</span>
      <span class="leg-item leg-item--violet">Pauta</span>
      <span class="leg-sep">→</span>
      <span class="leg-result">Ritmo bomba</span>
    </div>

    <!-- Flow canvas -->
    <div class="flow-container">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :node-types="nodeTypes"
        fit-view-on-init
        :min-zoom="0.3"
        :max-zoom="2.5"
        :pan-on-scroll="false"
        :zoom-on-double-click="false"
        :nodes-draggable="true"
        :nodes-connectable="false"
        :elements-selectable="false"
      />
    </div>
  </div>
</template>

<!-- Global: sobrescribir estilos internos de Vue Flow -->
<style>
.vue-flow__node {
  overflow: visible !important;
  cursor: default !important;
}
.vue-flow__node:focus,
.vue-flow__node.selected {
  outline: none !important;
  box-shadow: none !important;
}
.vue-flow__handle {
  width: 10px !important;
  height: 10px !important;
  border-radius: 50% !important;
  cursor: default !important;
}
.vue-flow__edge-path {
  stroke-linecap: round;
  stroke-linejoin: round;
}
/* Dot-grid background en el pane */
.vue-flow__pane {
  background-image: radial-gradient(circle, rgba(45,156,219,0.1) 1px, transparent 1px) !important;
  background-size: 22px 22px !important;
}
</style>

<style scoped>
.calc-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--nav-height, 60px));
  background: #030c17;
  overflow: hidden;
}

/* Toolbar */
.calc-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.25rem;
  background: rgba(5, 16, 30, 0.97);
  border-bottom: 1px solid rgba(45, 156, 219, 0.12);
  flex-shrink: 0;
  gap: 1rem;
}

.toolbar-title {
  font-family: var(--font-display, 'Barlow Condensed', sans-serif);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-primary, #2d9cdb);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0;
  line-height: 1;
}
.toolbar-sub {
  font-size: 0.68rem;
  color: rgba(125, 180, 200, 0.4);
  margin: 0.15rem 0 0;
  letter-spacing: 0.03em;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(45, 156, 219, 0.2);
  color: rgba(125, 180, 210, 0.65);
  padding: 0.42rem 0.85rem;
  border-radius: 7px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font-display, 'Barlow Condensed', sans-serif);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.reset-btn:hover {
  background: rgba(45, 156, 219, 0.1);
  border-color: rgba(45, 156, 219, 0.4);
  color: #7dd3f0;
}

/* Legend */
.legend {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 1.25rem;
  background: rgba(5, 14, 25, 0.8);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  font-family: var(--font-display, 'Barlow Condensed', sans-serif);
}

.leg-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.leg-item::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.leg-item--cyan   { color: rgba(45, 156, 219, 0.7);  }
.leg-item--cyan::before   { background: #2d9cdb; box-shadow: 0 0 6px rgba(45,156,219,0.5); }
.leg-item--indigo { color: rgba(129, 140, 248, 0.7); }
.leg-item--indigo::before { background: #818cf8; box-shadow: 0 0 6px rgba(129,140,248,0.5); }
.leg-item--green  { color: rgba(52, 211, 153, 0.7);  }
.leg-item--green::before  { background: #34d399; box-shadow: 0 0 6px rgba(52,211,153,0.5); }
.leg-item--violet { color: rgba(167, 139, 250, 0.7); }
.leg-item--violet::before { background: #a78bfa; box-shadow: 0 0 6px rgba(167,139,250,0.5); }

.leg-sep { color: rgba(255,255,255,0.2); margin: 0 0.1rem; }
.leg-result { color: rgba(125, 211, 240, 0.5); font-style: italic; }

/* Flow container */
.flow-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}
</style>
