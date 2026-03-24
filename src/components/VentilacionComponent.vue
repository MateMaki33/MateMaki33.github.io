<template>
  <div class="main-container">
    <h1>Ventilación Mecánica</h1>
    <p class="subtitle">Mi chuleta de referencia rápida</p>

    <!-- Tabs VMI / VNI -->
    <div class="tab-bar" role="tablist">
      <button
        class="tab"
        :class="{ active: activeTab === 'vmi' }"
        @click="activeTab = 'vmi'"
        role="tab"
        :aria-selected="activeTab === 'vmi'"
      >
        <span class="tab-icon">🫁</span>
        VMI
        <span class="tab-label">Invasiva</span>
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'vni' }"
        @click="activeTab = 'vni'"
        role="tab"
        :aria-selected="activeTab === 'vni'"
      >
        <span class="tab-icon">😷</span>
        VNI
        <span class="tab-label">No Invasiva</span>
      </button>
    </div>

    <!-- VMI Panel -->
    <div v-show="activeTab === 'vmi'" class="panel" role="tabpanel">

      <!-- Monitorización SpO2 -->
      <div class="accordion-item" :class="{ open: open.spo2 }">
        <button class="accordion-header" @click="toggle('spo2')">
          <span class="acc-badge badge-blue">SpO₂</span>
          <span class="acc-title">Monitorización Oxigenación</span>
          <span class="chevron">▾</span>
        </button>
        <div class="accordion-body">
          <ol class="step-list">
            <li v-for="(item, i) in data.vmi.monitorizacion_oxigenacion_spo2" :key="i">{{ item }}</li>
          </ol>
        </div>
      </div>

      <!-- Monitorización ETCO2 -->
      <div class="accordion-item" :class="{ open: open.etco2 }">
        <button class="accordion-header" @click="toggle('etco2')">
          <span class="acc-badge badge-yellow">ETCO₂</span>
          <span class="acc-title">Monitorización Ventilación</span>
          <span class="chevron">▾</span>
        </button>
        <div class="accordion-body">
          <div class="two-col">
            <div class="mini-card alert-red">
              <h4>⬆ Hipercapnia (hipoventilación)</h4>
              <p class="action-label">Acción: <strong>{{ data.vmi.monitorizacion_ventilacion_etco2.hipercapnia_por_hipoventilacion.accion }}</strong></p>
              <ol class="step-list">
                <li v-for="(p, i) in data.vmi.monitorizacion_ventilacion_etco2.hipercapnia_por_hipoventilacion.pasos" :key="i">{{ p }}</li>
              </ol>
            </div>
            <div class="mini-card alert-blue">
              <h4>⬇ Hipocapnia (hiperventilación)</h4>
              <p class="action-label">Acción: <strong>{{ data.vmi.monitorizacion_ventilacion_etco2.hipocapnia_por_hiperventilacion.accion }}</strong></p>
              <ol class="step-list">
                <li v-for="(p, i) in data.vmi.monitorizacion_ventilacion_etco2.hipocapnia_por_hiperventilacion.pasos" :key="i">{{ p }}</li>
              </ol>
            </div>
          </div>
          <div class="nota-box">
            <span class="nota-icon">📝</span>
            {{ data.vmi.monitorizacion_ventilacion_etco2.nota_patologia }}
          </div>
        </div>
      </div>

      <!-- Monitorización VME -->
      <div class="accordion-item" :class="{ open: open.vme }">
        <button class="accordion-header" @click="toggle('vme')">
          <span class="acc-badge badge-purple">VME</span>
          <span class="acc-title">Volumen Minuto Espirado</span>
          <span class="chevron">▾</span>
        </button>
        <div class="accordion-body">
          <div class="two-col">
            <div class="mini-card alert-blue">
              <h4>⬇ Disminución VME</h4>
              <ul class="bullet-list">
                <li v-for="(item, i) in data.vmi.monitorizacion_vme.disminucion_vme" :key="i">{{ item }}</li>
              </ul>
            </div>
            <div class="mini-card alert-orange">
              <h4>⬆ Aumento VME</h4>
              <ul class="bullet-list">
                <li v-for="(item, i) in data.vmi.monitorizacion_vme.aumento_vme" :key="i">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Curva Presión-Tiempo -->
      <div class="accordion-item" :class="{ open: open.presion }">
        <button class="accordion-header" @click="toggle('presion')">
          <span class="acc-badge badge-red">P/T</span>
          <span class="acc-title">Curva Presión-Tiempo</span>
          <span class="chevron">▾</span>
        </button>
        <div class="accordion-body">
          <div class="two-col">
            <div class="mini-card alert-red">
              <h4>⬆ PIP solo</h4>
              <p class="action-label">{{ data.vmi.curva_presion_tiempo.aumento_pip.significado }}</p>
              <ul class="bullet-list">
                <li v-for="(c, i) in data.vmi.curva_presion_tiempo.aumento_pip.causas" :key="i">{{ c }}</li>
              </ul>
            </div>
            <div class="mini-card alert-orange">
              <h4>⬆ PIP + Pplat</h4>
              <p class="action-label">{{ data.vmi.curva_presion_tiempo.aumento_pip_y_pplat.significado }}</p>
              <ul class="bullet-list">
                <li v-for="(c, i) in data.vmi.curva_presion_tiempo.aumento_pip_y_pplat.causas" :key="i">{{ c }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Curva Flujo-Tiempo -->
      <div class="accordion-item" :class="{ open: open.flujo }">
        <button class="accordion-header" @click="toggle('flujo')">
          <span class="acc-badge badge-green">F/T</span>
          <span class="acc-title">Curva Flujo-Tiempo</span>
          <span class="chevron">▾</span>
        </button>
        <div class="accordion-body">
          <div class="two-col">
            <div class="mini-card alert-orange">
              <h4>🔄 Atrapamiento Aéreo</h4>
              <p class="action-label"><strong>Signo:</strong> {{ data.vmi.curva_flujo_tiempo.atrapamiento_aereo.signo }}</p>
              <ol class="step-list">
                <li v-for="(s, i) in data.vmi.curva_flujo_tiempo.atrapamiento_aereo.solucion_secuencial" :key="i">{{ s }}</li>
              </ol>
            </div>
            <div class="mini-card alert-yellow">
              <h4>〰 Asincronías</h4>
              <p class="action-label"><strong>Signo:</strong> {{ data.vmi.curva_flujo_tiempo.asincronias.signo }}</p>
              <p>{{ data.vmi.curva_flujo_tiempo.asincronias.solucion }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- VNI Panel -->
    <div v-show="activeTab === 'vni'" class="panel" role="tabpanel">

      <!-- Indicación y Técnica -->
      <div class="accordion-item" :class="{ open: open.indicacion }">
        <button class="accordion-header" @click="toggle('indicacion')">
          <span class="acc-badge badge-green">INICIO</span>
          <span class="acc-title">Indicación y Técnica</span>
          <span class="chevron">▾</span>
        </button>
        <div class="accordion-body">
          <div class="two-col">
            <div class="mini-card">
              <h4>✅ Criterios de Selección</h4>
              <ul class="bullet-list">
                <li v-for="(c, i) in data.vni.indicacion_y_tecnica.criterios_seleccion" :key="i">{{ c }}</li>
              </ul>
            </div>
            <div class="mini-card">
              <h4>📋 Pasos de Inicio</h4>
              <ol class="step-list compact">
                <li v-for="(p, i) in data.vni.indicacion_y_tecnica.pasos_inicio" :key="i">{{ p }}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <!-- Objetivos -->
      <div class="accordion-item" :class="{ open: open.objetivos }">
        <button class="accordion-header" @click="toggle('objetivos')">
          <span class="acc-badge badge-blue">OBJETIVO</span>
          <span class="acc-title">Objetivos y Monitorización</span>
          <span class="chevron">▾</span>
        </button>
        <div class="accordion-body">
          <ul class="bullet-list checklist">
            <li v-for="(o, i) in data.vni.objetivos_monitorizacion_y_ajuste" :key="i">{{ o }}</li>
          </ul>
        </div>
      </div>

      <!-- Ajustes finos VNI -->
      <div class="accordion-item" :class="{ open: open.ajustes }">
        <button class="accordion-header" @click="toggle('ajustes')">
          <span class="acc-badge badge-yellow">AJUSTE</span>
          <span class="acc-title">Ajustes Finos VNI</span>
          <span class="chevron">▾</span>
        </button>
        <div class="accordion-body">
          <div class="params-grid">
            <div class="param-card" v-for="(value, key) in data.vni.ajustes_finos_vni" :key="key">
              <span class="param-key">{{ formatKey(key) }}</span>
              <span class="param-val">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Problemas y Soluciones -->
      <div class="accordion-item" :class="{ open: open.problemas }">
        <button class="accordion-header" @click="toggle('problemas')">
          <span class="acc-badge badge-red">PROB</span>
          <span class="acc-title">Problemas y Soluciones</span>
          <span class="chevron">▾</span>
        </button>
        <div class="accordion-body">
          <!-- Sub-tabs CPAP/BiPAP -->
          <div class="sub-tabs">
            <button class="sub-tab" :class="{ active: subTab === 'cpap' }" @click="subTab = 'cpap'">CPAP</button>
            <button class="sub-tab" :class="{ active: subTab === 'bipap' }" @click="subTab = 'bipap'">BiPAP</button>
          </div>
          <div v-show="subTab === 'cpap'" class="problems-grid">
            <div class="problem-card" v-for="(steps, problem) in data.vni.problemas_y_soluciones.cpap" :key="problem">
              <h4 class="problem-title">{{ formatKey(problem) }}</h4>
              <ol class="step-list compact">
                <li v-for="(s, i) in steps" :key="i">{{ s }}</li>
              </ol>
            </div>
          </div>
          <div v-show="subTab === 'bipap'" class="problems-grid">
            <div class="problem-card" v-for="(steps, problem) in data.vni.problemas_y_soluciones.bipap" :key="problem">
              <h4 class="problem-title">{{ formatKey(problem) }}</h4>
              <ol class="step-list compact">
                <li v-for="(s, i) in steps" :key="i">{{ s }}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <!-- Asincronías BiPAP -->
      <div class="accordion-item" :class="{ open: open.asincronias }">
        <button class="accordion-header" @click="toggle('asincronias')">
          <span class="acc-badge badge-purple">ASYNC</span>
          <span class="acc-title">Asincronías BiPAP</span>
          <span class="chevron">▾</span>
        </button>
        <div class="accordion-body">

          <h4 class="section-subhead">Inspiración</h4>
          <div class="two-col">
            <div class="mini-card alert-red">
              <h4>⚡ Autociclado</h4>
              <p class="action-label">{{ data.vni.asincronias_bipap.inspiracion.autociclado.descripcion }}</p>
              <ol class="step-list compact">
                <li v-for="(s, i) in data.vni.asincronias_bipap.inspiracion.autociclado.solucion" :key="i">{{ s }}</li>
              </ol>
            </div>
            <div class="mini-card alert-orange">
              <h4>🔇 Disparo Ineficaz</h4>
              <p class="action-label">{{ data.vni.asincronias_bipap.inspiracion.disparo_ineficaz.descripcion }}</p>
              <ol class="step-list compact">
                <li v-for="(s, i) in data.vni.asincronias_bipap.inspiracion.disparo_ineficaz.solucion" :key="i">{{ s }}</li>
              </ol>
            </div>
          </div>

          <h4 class="section-subhead">Modo Flujo</h4>
          <div class="two-col">
            <div class="mini-card alert-blue">
              <h4>⬇ Flujo Bajo</h4>
              <p>{{ data.vni.asincronias_bipap.modo_flujo.flujo_bajo }}</p>
            </div>
            <div class="mini-card alert-yellow">
              <h4>⬆ Flujo Excesivo</h4>
              <p>{{ data.vni.asincronias_bipap.modo_flujo.flujo_excesivo }}</p>
            </div>
          </div>

          <h4 class="section-subhead">Espiración</h4>
          <div class="two-col">
            <div class="mini-card alert-purple">
              <h4>✂ Ciclado Prematuro</h4>
              <p class="action-label">{{ data.vni.asincronias_bipap.espiracion.doble_disparo_ciclado_prematuro.descripcion }}</p>
              <p><strong>Solución:</strong> {{ data.vni.asincronias_bipap.espiracion.doble_disparo_ciclado_prematuro.solucion }}</p>
            </div>
            <div class="mini-card alert-green">
              <h4>⏳ Ciclado Retrasado</h4>
              <p class="action-label">{{ data.vni.asincronias_bipap.espiracion.ciclado_retrasado.descripcion }}</p>
              <p><strong>Solución:</strong> {{ data.vni.asincronias_bipap.espiracion.ciclado_retrasado.solucion }}</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import data from '../collections/ventilacion-mecanica.json'

const activeTab = ref('vmi')
const subTab = ref('cpap')

const open = reactive({
  // VMI
  spo2: false,
  etco2: false,
  vme: false,
  presion: false,
  flujo: false,
  // VNI
  indicacion: false,
  objetivos: false,
  ajustes: false,
  problemas: false,
  asincronias: false,
})

function toggle(key) {
  open[key] = !open[key]
}

function formatKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}
</script>

<style scoped>
/* ── Layout ─────────────────────────────── */
.main-container {
  min-width: min(90dvw, 100%);
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0.5rem 1rem 3rem;
  color: var(--color-text);
}

h1 {
  font-family: var(--font-display);
  font-size: clamp(1.7rem, 5vw, 2.5rem);
  background: linear-gradient(135deg, var(--color-headline-gradient-start), var(--color-headline-gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  margin-bottom: 0.25rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.subtitle {
  text-align: center;
  color: rgba(228, 239, 248, 0.4);
  font-size: 0.82rem;
  margin: 0 0 1.5rem;
  letter-spacing: 0.06em;
  font-style: italic;
}

/* ── Tab Bar ─────────────────────────────── */
.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  background: rgba(5, 16, 30, 0.7);
  padding: 0.35rem;
  border-radius: 12px;
  border: 1px solid rgba(45, 156, 219, 0.2);
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.65rem 1rem;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: rgba(228, 239, 248, 0.4);
  cursor: pointer;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.05em;
  transition: all 0.22s ease;
  line-height: 1.1;
}

.tab-icon {
  font-size: 1.3rem;
}

.tab-label {
  font-size: 0.68rem;
  font-weight: 500;
  opacity: 0.65;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tab.active {
  background: rgba(45, 156, 219, 0.12);
  color: var(--color-subtitle);
  border: 1px solid rgba(45, 156, 219, 0.35);
  box-shadow: 0 0 16px rgba(45, 156, 219, 0.12);
}

.tab:not(.active):hover {
  color: rgba(228, 239, 248, 0.7);
  background: rgba(45, 156, 219, 0.06);
}

/* ── Panel ─────────────────────────────── */
.panel {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* ── Accordion ─────────────────────────── */
.accordion-item {
  background: var(--color-card-bg);
  border: 1px solid rgba(45, 156, 219, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.accordion-item.open {
  border-color: rgba(45, 156, 219, 0.4);
  box-shadow: var(--shadow-card);
}

.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-display);
  color: var(--color-text);
  text-align: left;
  transition: background 0.2s ease;
  min-height: 52px;
}

.accordion-header:hover {
  background: rgba(45, 156, 219, 0.07);
}

.acc-title {
  flex: 1;
  font-weight: 600;
  font-size: 0.92rem;
  letter-spacing: 0.02em;
}

.chevron {
  font-style: normal;
  font-size: 0.75rem;
  color: rgba(228, 239, 248, 0.4);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.accordion-item.open .chevron {
  transform: rotate(180deg);
}

.accordion-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
  padding: 0 1rem;
}

.accordion-item.open .accordion-body {
  max-height: 2000px;
  padding: 0 1rem 1rem;
}

/* ── Badges ─────────────────────────────── */
.acc-badge {
  display: inline-block;
  padding: 0.2em 0.55em;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.badge-blue   { background: rgba(45,156,219,0.15);  color: #7ed6f8; border: 1px solid rgba(45,156,219,0.35); }
.badge-yellow { background: rgba(234,179,8,0.15);   color: #fde68a; border: 1px solid rgba(234,179,8,0.35); }
.badge-purple { background: rgba(139,92,246,0.15);  color: #c4b5fd; border: 1px solid rgba(139,92,246,0.35); }
.badge-red    { background: rgba(239,68,68,0.15);   color: #fca5a5; border: 1px solid rgba(239,68,68,0.35); }
.badge-green  { background: rgba(16,185,129,0.15);  color: #6ee7b7; border: 1px solid rgba(16,185,129,0.35); }

/* ── Two-column grid ─────────────────── */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

@media (max-width: 560px) {
  .two-col { grid-template-columns: 1fr; }
}

/* ── Mini Cards ─────────────────────── */
.mini-card {
  border-radius: 10px;
  padding: 0.85rem;
  font-size: 0.875rem;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.08);
}

.mini-card h4 {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--color-subtitle);
}

.mini-card p { margin: 0.25rem 0; }

.alert-red    { border-color: rgba(239,68,68,0.35);   background: rgba(239,68,68,0.07); }
.alert-red h4 { color: #fca5a5; }
.alert-orange { border-color: rgba(255,153,0,0.35);   background: rgba(255,153,0,0.07); }
.alert-orange h4 { color: var(--neon-glow); }
.alert-blue   { border-color: rgba(59,130,246,0.35);  background: rgba(59,130,246,0.07); }
.alert-blue h4 { color: #93c5fd; }
.alert-yellow { border-color: rgba(234,179,8,0.35);   background: rgba(234,179,8,0.07); }
.alert-yellow h4 { color: #fde68a; }
.alert-green  { border-color: rgba(34,197,94,0.35);   background: rgba(34,197,94,0.07); }
.alert-green h4 { color: #86efac; }
.alert-purple { border-color: rgba(147,51,234,0.35);  background: rgba(147,51,234,0.07); }
.alert-purple h4 { color: #d8b4fe; }

/* ── Lists ─────────────────────────── */
.step-list, .bullet-list {
  margin: 0.25rem 0 0;
  padding-left: 1.3rem;
  font-size: 0.85rem;
  line-height: 1.5;
}

.step-list li, .bullet-list li {
  margin-top: 0.35rem;
  font-size: 0.85rem;
}

.compact li { margin-top: 0.25rem; }

.checklist li::marker { content: '✓  '; color: #86efac; }

/* ── Nota Box ─────────────────────── */
.nota-box {
  margin-top: 0.75rem;
  padding: 0.7rem 1rem;
  background: rgba(234,179,8,0.08);
  border-left: 3px solid #fde68a;
  border-radius: 0 8px 8px 0;
  font-size: 0.85rem;
  color: #fde68a;
  display: flex;
  gap: 0.5rem;
}

.nota-icon { flex-shrink: 0; }

/* ── Action Label ─────────────────── */
.action-label {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.65);
  margin-bottom: 0.4rem;
}

/* ── Params Grid (Ajustes Finos) ─── */
.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.param-card {
  background: rgba(5, 16, 30, 0.6);
  border: 1px solid rgba(45, 156, 219, 0.2);
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: border-color 0.2s ease;
}

.param-card:hover {
  border-color: rgba(45, 156, 219, 0.4);
}

.param-key {
  font-family: var(--font-display);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.8;
}

.param-val {
  font-size: 0.82rem;
  color: var(--color-text);
  line-height: 1.45;
}

/* ── Sub-tabs (CPAP/BiPAP) ─────────── */
.sub-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.sub-tab {
  padding: 0.4rem 1.1rem;
  border-radius: 8px;
  border: 1px solid rgba(45, 156, 219, 0.25);
  background: transparent;
  color: rgba(228, 239, 248, 0.45);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sub-tab.active {
  background: rgba(45, 156, 219, 0.15);
  color: var(--color-subtitle);
  border-color: rgba(45, 156, 219, 0.45);
}

.sub-tab:not(.active):hover {
  color: rgba(228, 239, 248, 0.7);
  background: rgba(45, 156, 219, 0.07);
}

/* ── Problems Grid ─────────────────── */
.problems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 0.65rem;
}

.problem-card {
  background: rgba(5, 16, 30, 0.6);
  border: 1px solid rgba(45, 156, 219, 0.18);
  border-radius: 10px;
  padding: 0.8rem;
  transition: border-color 0.2s ease;
}

.problem-card:hover {
  border-color: rgba(45, 156, 219, 0.35);
}

.problem-title {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  color: var(--color-subtitle);
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ── Section Subhead ─────────────── */
.section-subhead {
  margin: 1rem 0 0.5rem;
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(228, 239, 248, 0.4);
  border-bottom: 1px solid rgba(45, 156, 219, 0.15);
  padding-bottom: 0.3rem;
}
</style>
