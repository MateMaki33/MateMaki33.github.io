<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Índice de Shock</button>

    <dialog ref="modal">
      <h2>Indice Shock</h2>
      <form method="dialog" @submit.prevent>
        <div class="form-group">
          <label>Frecuencia Cardiaca:</label>
          <input type="number" v-model.number="fc" min="0" />
        </div>

        <div class="form-group">
          <label>Tensión Sistólica:</label>
          <input type="number" v-model.number="tas" min="0" />
        </div>

        <div class="score">
          <p>
            Índice: <strong>{{ indiceShock.toFixed(2) }}</strong>
          </p>
          <p v-if="transfusion" class="active">NECESARIO TRANSFUNDIR</p>
        </div>

        <button class="btn-glow" @click="closeModal">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const modal = ref(null);
const fc = ref(0);
const tas = ref(0);

const indiceShock = computed(() => {
  if (tas.value === 0 || isNaN(fc.value) || isNaN(tas.value)) {
    return 0;
  }
  return fc.value / tas.value;
});

const transfusion = computed(() => {
  return indiceShock.value > 0.9;
});

const openModal = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
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

.active {
  display: block;
  color: #f87171;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.88rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.45rem 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  margin-top: 0.5rem;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] { -moz-appearance: textfield; }
</style>
