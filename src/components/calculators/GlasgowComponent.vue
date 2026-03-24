<template>
  <div class="calc-wrapper">
    <button class="btn-calc" @click="openModal">Calcular Glasgow</button>

    <dialog ref="modal">
      <h2>Escala de Glasgow</h2>
      <form method="dialog" @submit.prevent>

        <div class="form-group">
          <label>Apertura ocular</label>
          <select v-model.number="ocular">
            <option :value="4">Espontánea (4)</option>
            <option :value="3">Al habla (3)</option>
            <option :value="2">Al dolor (2)</option>
            <option :value="1">Ninguna (1)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Respuesta verbal</label>
          <select v-model.number="verbal">
            <option :value="5">Orientado (5)</option>
            <option :value="4">Confuso (4)</option>
            <option :value="3">Inapropiado (3)</option>
            <option :value="2">Incomprensible (2)</option>
            <option :value="1">Ninguna (1)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Respuesta motora</label>
          <select v-model.number="motora">
            <option :value="6">Obedece órdenes (6)</option>
            <option :value="5">Localiza dolor (5)</option>
            <option :value="4">Retira al dolor (4)</option>
            <option :value="3">Flexión anormal (3)</option>
            <option :value="2">Extensión (2)</option>
            <option :value="1">Ninguna (1)</option>
          </select>
        </div>

        <div class="score-panel" :class="scoreClass">
          <div class="score-value">{{ total }}</div>
          <div class="score-details">
            <div class="score-label">Glasgow</div>
            <div class="score-interpretation">{{ interpretacion }}</div>
          </div>
        </div>

        <button class="btn" type="button" @click="closeModal">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const modal = ref(null);
const ocular = ref(4);
const verbal = ref(5);
const motora = ref(6);

const total = computed(() => ocular.value + verbal.value + motora.value);

const interpretacion = computed(() => {
  const t = total.value;
  if (t >= 13) return 'Traumatismo leve';
  if (t >= 9)  return 'Traumatismo moderado';
  return 'Traumatismo grave';
});

const scoreClass = computed(() => {
  const t = total.value;
  if (t >= 13) return 'score-mild';
  if (t >= 9)  return 'score-moderate';
  return 'score-severe';
});

const openModal  = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>

<style scoped>
.calc-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Trigger button inherits .btn from global but with override */
.btn-calc {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(45, 156, 219, 0.08);
  border: 1px solid rgba(45, 156, 219, 0.38);
  color: var(--color-btn-text);
  padding: 0.75rem 1.35rem;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.92rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 8px;
  cursor: pointer;
  min-height: 48px;
  transition: all 0.2s ease;
}

.btn-calc:hover {
  background: rgba(45, 156, 219, 0.2);
  border-color: var(--color-primary);
  box-shadow: 0 0 24px rgba(45, 156, 219, 0.4);
  color: #ffffff;
}

/* Form groups */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

/* Score panel */
.score-panel {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  margin: 0.5rem 0 1.25rem;
  border: 1px solid;
  transition: all 0.3s ease;
}

.score-value {
  font-family: var(--font-mono);
  font-size: 2.8rem;
  font-weight: 500;
  line-height: 1;
  min-width: 3rem;
  text-align: center;
}

.score-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.score-label {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.55;
}

.score-interpretation {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

/* Severity states */
.score-mild {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.3);
}
.score-mild .score-value        { color: #34d399; }
.score-mild .score-interpretation { color: #6ee7b7; }

.score-moderate {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.3);
}
.score-moderate .score-value        { color: var(--neon-orange); }
.score-moderate .score-interpretation { color: var(--neon-glow); }

.score-severe {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
}
.score-severe .score-value        { color: #f87171; }
.score-severe .score-interpretation { color: #fca5a5; }

/* Remove spin buttons from number inputs */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] { -moz-appearance: textfield; }
</style>
