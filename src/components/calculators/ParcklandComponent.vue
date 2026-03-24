<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Fórmula de Parkland</button>

    <dialog ref="modal">
      <h2>Reposición hídrica (Parkland)</h2>
      <form method="dialog" @submit.prevent>
        <div class="form-group">
          <label>Peso (kg):</label>
          <input type="number" v-model.number="peso" min="0" placeholder="Ej. 70" />
        </div>

        <div class="form-group">
          <label>% SCQ quemada:</label>
          <input type="number" v-model.number="scq" min="0" max="100" placeholder="Ej. 30" />
        </div>

        <div class="score" v-if="volumenTotal">
          <p><strong>Volumen total:</strong> {{ volumenTotal }} ml</p>
          <p><strong>Primeras 8h:</strong> {{ mitad }} ml</p>
          <p><strong>Siguientes 16h:</strong> {{ mitad }} ml</p>
          <p class="text-muted">Desde el momento de la quemadura.</p>
        </div>

        <button class="btn-glow" @click="closeModal">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const modal = ref(null)

const peso = ref(70)
const scq = ref(0)

const volumenTotal = computed(() => {
  if (!peso.value || !scq.value) return null
  return Math.round(4 * peso.value * scq.value)
})

const mitad = computed(() => {
  return volumenTotal.value ? Math.round(volumenTotal.value / 2) : null
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

.text-muted {
  font-size: 0.82rem;
  color: rgba(228, 239, 248, 0.45);
  margin-top: 0.35rem;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] { -moz-appearance: textfield; }
</style>
