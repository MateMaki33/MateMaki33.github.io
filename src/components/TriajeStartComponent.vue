<template>
  <div class="triage-wrapper">

    <!-- ── Start Screen ── -->
    <div class="triage-card" v-if="!activeQuestion && !finalClassification">
      <div class="triage-header">
        <div class="triage-badge">Sistema START</div>
        <h1>Método START</h1>
        <p class="triage-subtitle">Simple Triage And Rapid Treatment</p>
      </div>

      <button @click="startTriage" class="btn-start">
        <span class="btn-start-icon">▶</span>
        INICIAR TRIAGE
      </button>

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
              <span class="legend-color-name">{{ category.color }}</span>
              <span class="legend-desc">{{ category.descripcion }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Active Question ── -->
    <div class="triage-card question-card" v-if="activeQuestion">
      <div class="question-header">
        <div class="question-step">Evaluación</div>
        <h2 class="question-text">{{ activeQuestion.parametro }}</h2>
        <p class="question-hint" v-if="activeQuestion.evaluacion">{{ activeQuestion.evaluacion }}</p>
      </div>

      <div class="options-list">
        <button
          v-for="(option, index) in activeQuestionOptions"
          :key="index"
          class="option-btn"
          @click="selectOption(option)"
        >
          <span class="option-arrow">›</span>
          <span class="option-text">{{ option.condition }}</span>
        </button>
      </div>

      <button @click="resetTriage" class="btn-reset">Reiniciar</button>
    </div>

    <!-- ── Final Result ── -->
    <div class="triage-card result-card" v-if="finalClassification">
      <div class="result-label">Resultado Triage</div>

      <div class="result-box" :class="`result-${finalClassification.color.toLowerCase()}`">
        <div class="result-dot"></div>
        <div class="result-color-name">{{ finalClassification.color }}</div>
        <div class="result-description">{{ finalClassification.descripcion }}</div>
      </div>

      <button @click="resetTriage" class="btn-reset">Nuevo Triaje</button>
    </div>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import triageData from '../collections/start.json';

const currentStepIndex = ref(0);
const activeQuestion = ref(null);
const finalClassification = ref(null);

const startTriage = () => {
  currentStepIndex.value = 0;
  finalClassification.value = null;
  setActiveQuestion();
};

const setActiveQuestion = () => {
  activeQuestion.value = triageData.pasos_evaluacion[currentStepIndex.value] || null;
};

const activeQuestionOptions = computed(() => {
  if (!activeQuestion.value) return [];
  return activeQuestion.value.acciones_decision.flatMap(decision => {
    if (decision.sub_condiciones) {
      return decision.sub_condiciones.map(sub => ({
        condition: `${decision.condicion} → ${sub.condicion}`,
        classification: sub.clasificacion,
        nextSteps: sub.siguiente_paso,
      }));
    }
    return [{
      condition: decision.condicion,
      classification: decision.clasificacion,
      nextSteps: decision.siguiente_paso,
    }];
  });
});

const selectOption = (option) => {
  const { classification, nextSteps } = option;

  if (['Rojo', 'Amarillo', 'Verde', 'Negro'].includes(classification)) {
    finalClassification.value = triageData.categorias_triaje.find(c => c.color === classification);
    activeQuestion.value = null;
    return;
  }

  if (
    activeQuestion.value.parametro === "Ambulación (¿Puede caminar?)" &&
    option.condition.includes("Puede caminar")
  ) {
    finalClassification.value = triageData.categorias_triaje.find(c => c.color === 'Verde');
    activeQuestion.value = null;
    return;
  }

  const pasos =
    nextSteps === undefined || nextSteps === null
      ? []
      : Array.isArray(nextSteps)
      ? nextSteps
      : [nextSteps];

  for (let paso of pasos) {
    if (paso.startsWith("Continuar con")) {
      const param = paso.split("'")[1];
      const next = triageData.pasos_evaluacion.find(step => step.parametro === param);
      if (next) {
        currentStepIndex.value = triageData.pasos_evaluacion.indexOf(next);
        setActiveQuestion();
        return;
      }
    }
  }

  currentStepIndex.value++;
  setActiveQuestion();
};

const resetTriage = () => {
  currentStepIndex.value = 0;
  activeQuestion.value = null;
  finalClassification.value = null;
};
</script>

<style scoped>
/* ── Wrapper ── */
.triage-wrapper {
  width: 100%;
  max-width: 600px;
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
  gap: 1.5rem;
  animation: cardIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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

@keyframes cardIn {
  from { opacity: 0; transform: translateY(10px) scale(0.99); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Start screen header ── */
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

/* ── Start Button ── */
.btn-start {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(45, 156, 219, 0.12);
  border: 1px solid rgba(45, 156, 219, 0.45);
  color: var(--color-subtitle);
  padding: 1.1rem 2rem;
  border-radius: 12px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 0 30px rgba(45, 156, 219, 0.1);
  min-height: 56px;
  position: relative;
  overflow: hidden;
}

.btn-start::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(45, 156, 219, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.btn-start:hover {
  background: rgba(45, 156, 219, 0.22);
  border-color: var(--color-primary);
  box-shadow: 0 0 40px rgba(45, 156, 219, 0.3), 0 4px 20px rgba(0, 0, 0, 0.3);
  color: #ffffff;
  transform: translateY(-2px);
}

.btn-start:hover::before { opacity: 1; }
.btn-start:active { transform: translateY(0); }

.btn-start-icon {
  font-size: 0.85em;
  transition: transform 0.25s ease;
}

.btn-start:hover .btn-start-icon {
  transform: scale(1.3);
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
  transition: background 0.15s ease;
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

/* ── Question card ── */
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

/* ── Options ── */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: rgba(10, 26, 46, 0.7);
  border: 1px solid rgba(45, 156, 219, 0.22);
  border-radius: 10px;
  padding: 0.9rem 1.1rem;
  color: var(--color-text);
  font-family: var(--font-family);
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 52px;
}

.option-btn:hover {
  background: rgba(45, 156, 219, 0.12);
  border-color: rgba(45, 156, 219, 0.5);
  transform: translateX(4px);
}

.option-arrow {
  color: var(--color-primary);
  font-size: 1.2rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.option-btn:hover .option-arrow {
  transform: translateX(3px);
}

.option-text { flex: 1; line-height: 1.4; }

/* ── Reset button ── */
.btn-reset {
  align-self: center;
  background: transparent;
  border: 1px solid rgba(228, 239, 248, 0.15);
  border-radius: 8px;
  color: rgba(228, 239, 248, 0.4);
  padding: 0.55rem 1.5rem;
  font-family: var(--font-display);
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
}

.btn-reset:hover {
  color: rgba(228, 239, 248, 0.75);
  border-color: rgba(228, 239, 248, 0.3);
}

/* ── Result ── */
.result-label {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(228, 239, 248, 0.4);
  text-align: center;
}

.result-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  border-radius: 12px;
  border: 1px solid;
  animation: resultPop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes resultPop {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

.result-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  animation: pulseDot 1.8s ease-in-out infinite;
}

@keyframes pulseDot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

.result-color-name {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1;
}

.result-description {
  font-size: 0.92rem;
  text-align: center;
  opacity: 0.8;
  max-width: 320px;
  line-height: 1.5;
}

/* Result color variants */
.result-rojo {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.4);
}
.result-rojo .result-dot         { background: #ef4444; box-shadow: 0 0 16px rgba(239, 68, 68, 0.6); }
.result-rojo .result-color-name  { color: #f87171; }
.result-rojo .result-description { color: #fca5a5; }

.result-amarillo {
  background: rgba(234, 179, 8, 0.1);
  border-color: rgba(234, 179, 8, 0.4);
}
.result-amarillo .result-dot         { background: #eab308; box-shadow: 0 0 16px rgba(234, 179, 8, 0.6); }
.result-amarillo .result-color-name  { color: #fbbf24; }
.result-amarillo .result-description { color: #fde68a; }

.result-verde {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.4);
}
.result-verde .result-dot         { background: #10b981; box-shadow: 0 0 16px rgba(16, 185, 129, 0.6); }
.result-verde .result-color-name  { color: #34d399; }
.result-verde .result-description { color: #6ee7b7; }

.result-negro {
  background: rgba(100, 116, 139, 0.1);
  border-color: rgba(100, 116, 139, 0.4);
}
.result-negro .result-dot         { background: #64748b; }
.result-negro .result-color-name  { color: #94a3b8; }
.result-negro .result-description { color: #cbd5e1; }

/* Responsive */
@media (max-width: 480px) {
  .triage-card { padding: 1.5rem; }
  .result-color-name { font-size: 1.8rem; }
}
</style>
