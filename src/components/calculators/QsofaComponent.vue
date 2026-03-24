<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Calcular qSOFA</button>

    <dialog ref="modal">
      <h2>qSOFA</h2>
      <form method="dialog" @submit.prevent>
        <div class="form-group">
          <label>Frecuencia Respiratoria (≥22):</label>
          <input type="number" v-model.number="fr" min="0" />
        </div>

        <div class="form-group">
          <label>Tensión Sistólica (≤100 mmHg):</label>
          <input type="number" v-model.number="tas" min="0" />
        </div>

        <div class="form-group">
          <label>Escala de Glasgow (&lt;15):</label>
          <input type="number" v-model.number="glasgow" min="3" max="15" />
        </div>

        <div class="score">
          <p>Puntuación qSOFA: <strong>{{ qsofaScore }}</strong></p>
        </div>

        <button class="btn-glow" @click="closeModal">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const modal = ref(null)

const fr = ref(0)
const tas = ref(0)
const glasgow = ref(15)

const qsofaScore = computed(() => {
  let score = 0
  if (fr.value >= 22) score++
  if (tas.value <= 100) score++
  if (glasgow.value < 15) score++
  return score
})

const openModal = () => modal.value?.showModal()
const closeModal = () => modal.value?.close()
</script>

<style scoped>
.btn-glow {
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

.btn-glow:hover {
  background: rgba(45, 156, 219, 0.2);
  border-color: var(--color-primary);
  box-shadow: 0 0 28px rgba(45, 156, 219, 0.4);
  color: #ffffff;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.score {
  margin: 0.5rem 0 1rem;
  padding: 0.85rem 1rem;
  background: rgba(45, 156, 219, 0.06);
  border: 1px solid rgba(45, 156, 219, 0.2);
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-subtitle);
}

.score p { margin: 0.25rem 0; }

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] { -moz-appearance: textfield; }
</style>
