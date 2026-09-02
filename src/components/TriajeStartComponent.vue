<template>
  <div class="triage-wrapper">
    <div class="triage-card">
      <div class="triage-header">
        <div class="triage-badge">Sistema START</div>
        <h1>Método START</h1>
        <p class="triage-subtitle">Simple Triage And Rapid Treatment</p>
      </div>

      <p class="calc-hint">
        Algoritmo de referencia — la clasificación de cada víctima la determina el clínico aplicando
        estos pasos en orden.
      </p>

      <div class="legend">
        <div class="legend-title">Clasificaciones</div>
        <div class="legend-grid">
          <div
            v-for="category in triageData.categorias_triaje"
            :key="category.color"
            class="legend-item"
            :class="`legend-${category.color.toLowerCase()}`"
          >
            <div class="legend-dot"></div>
            <div class="legend-info">
              <span class="legend-color-name">{{ category.color }} · {{ category.prioridad }}</span>
              <span class="legend-desc">{{ category.descripcion }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-for="paso in triageData.pasos_evaluacion" :key="paso.orden" class="triage-card step-card">
      <div class="question-header">
        <div class="question-step">Paso {{ paso.orden }}</div>
        <h2 class="question-text">{{ paso.parametro }}</h2>
        <p class="question-hint" v-if="paso.evaluacion">{{ paso.evaluacion }}</p>
      </div>

      <ul class="branch-list">
        <template v-for="(d, i) in paso.acciones_decision" :key="i">
          <li v-if="!d.sub_condiciones" class="branch">
            <span class="branch-cond">{{ d.condicion }}</span>
            <span class="branch-arrow">→</span>
            <span class="branch-result" :class="outcomeClass(d)">{{ outcomeText(d) }}</span>
          </li>
          <template v-else>
            <li class="branch-heading">{{ d.condicion }}</li>
            <li v-for="(sub, j) in d.sub_condiciones" :key="j" class="branch branch--sub">
              <span class="branch-cond">{{ sub.condicion }}</span>
              <span class="branch-arrow">→</span>
              <span class="branch-result" :class="outcomeClass(sub)">{{ outcomeText(sub) }}</span>
            </li>
          </template>
        </template>
      </ul>
    </div>

    <div class="triage-card">
      <div class="legend-title">Principios clave</div>
      <ul class="principles">
        <li v-for="(p, i) in triageData.principios_clave" :key="i">{{ p }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import triageData from '../collections/start.json';

const COLORS = ['Rojo', 'Amarillo', 'Verde', 'Negro'];
const isColor = (c) => COLORS.includes(c);

function outcomeText(d) {
  if (d.clasificacion && isColor(d.clasificacion)) return d.clasificacion;
  return d.clasificacion || d.siguiente_paso || '';
}
function outcomeClass(d) {
  if (d.clasificacion && isColor(d.clasificacion)) return `is-${d.clasificacion.toLowerCase()}`;
  return 'is-continue';
}
</script>

<style scoped>
/* ── Wrapper ── */
.triage-wrapper {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 2rem;
}

/* ── Card base ── */
.triage-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
}

.triage-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
}

/* ── Header ── */
.triage-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.triage-badge {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-primary);
  background: rgba(45, 156, 219, 0.1);
  border: 1px solid rgba(45, 156, 219, 0.25);
  padding: 0.3rem 0.85rem;
  border-radius: 100px;
  margin-bottom: 0.5rem;
}

.triage-header h1 {
  margin: 0;
  font-size: clamp(1.8rem, 6vw, 2.4rem);
}

.triage-subtitle {
  font-size: 0.82rem;
  color: rgba(228, 239, 248, 0.45);
  letter-spacing: 0.08em;
  font-style: italic;
  margin: 0;
}

/* ── Legend ── */
.legend { display: flex; flex-direction: column; gap: 0.75rem; }

.legend-title {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(228, 239, 248, 0.4);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(45, 156, 219, 0.1);
}

.legend-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  border: 1px solid transparent;
}

.legend-rojo    { background: rgba(239, 68, 68, 0.07);  border-color: rgba(239, 68, 68, 0.18); }
.legend-amarillo { background: rgba(234, 179, 8, 0.07); border-color: rgba(234, 179, 8, 0.18); }
.legend-verde   { background: rgba(16, 185, 129, 0.07); border-color: rgba(16, 185, 129, 0.18); }
.legend-negro   { background: rgba(100, 116, 139, 0.07); border-color: rgba(100, 116, 139, 0.18); }

.legend-dot {
  width: 12px;
  height: 12px;
  min-width: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-rojo .legend-dot     { background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }
.legend-amarillo .legend-dot { background: #eab308; box-shadow: 0 0 8px rgba(234, 179, 8, 0.5); }
.legend-verde .legend-dot    { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
.legend-negro .legend-dot    { background: #64748b; }

.legend-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.legend-color-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.88rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.legend-rojo .legend-color-name     { color: #f87171; }
.legend-amarillo .legend-color-name { color: #fbbf24; }
.legend-verde .legend-color-name    { color: #34d399; }
.legend-negro .legend-color-name    { color: #94a3b8; }

.legend-desc {
  font-size: 0.8rem;
  color: rgba(228, 239, 248, 0.55);
  line-height: 1.3;
}

/* ── Step card ── */
.question-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.question-step {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-primary);
  opacity: 0.7;
}

.question-text {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 3vw, 1.45rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.question-hint {
  font-size: 0.85rem;
  color: rgba(228, 239, 248, 0.5);
  margin: 0;
  line-height: 1.4;
}

/* ── Branch list (decision outcomes) ── */
.branch-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; }
.branch-heading {
  font-family: var(--font-display);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(228, 239, 248, 0.5);
  margin-top: 0.3rem;
}
.branch {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  background: rgba(10, 26, 46, 0.5);
  border: 1px solid rgba(45, 156, 219, 0.16);
  border-radius: 9px;
  padding: 0.65rem 0.9rem;
}
.branch--sub { margin-left: 0.75rem; }
.branch-cond { flex: 1; min-width: 160px; font-size: 0.88rem; color: var(--color-text); }
.branch-arrow { color: var(--color-primary); font-weight: 700; flex-shrink: 0; }
.branch-result {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  white-space: nowrap;
}
.branch-result.is-rojo     { background: rgba(239, 68, 68, 0.14); color: #f87171; }
.branch-result.is-amarillo { background: rgba(234, 179, 8, 0.14); color: #fbbf24; }
.branch-result.is-verde    { background: rgba(16, 185, 129, 0.14); color: #34d399; }
.branch-result.is-negro    { background: rgba(100, 116, 139, 0.16); color: #cbd5e1; }
.branch-result.is-continue { background: rgba(45, 156, 219, 0.12); color: #7dd3f0; text-transform: none; letter-spacing: 0.01em; }

/* ── Principles ── */
.principles { margin: 0; padding-left: 1.1rem; }
.principles li { font-size: 0.85rem; line-height: 1.5; color: rgba(228, 239, 248, 0.75); margin-bottom: 0.3rem; }

/* Responsive */
@media (max-width: 480px) {
  .triage-card { padding: 1.5rem; }
}
</style>
